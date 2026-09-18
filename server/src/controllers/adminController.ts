import { Response } from 'express';
import { db, checkAndExpireDonations } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { auditService } from '../services/auditService.js';
import { notificationService } from '../services/notificationService.js';

export const adminController = {
  // 1. Overview Statistics & Charts
  async getDashboardStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      checkAndExpireDonations();

      const userCounts = db.get<any>(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN role = 'donor' THEN 1 ELSE 0 END) as total_donors,
          SUM(CASE WHEN role = 'ngo' THEN 1 ELSE 0 END) as total_ngos,
          SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) as total_volunteers,
          SUM(CASE WHEN status = 'pending_verification' THEN 1 ELSE 0 END) as pending_users
        FROM users
      `);

      const donationCounts = db.get<any>(`
        SELECT 
          COUNT(*) as total_donations,
          SUM(CASE WHEN status IN ('AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED') THEN 1 ELSE 0 END) as active_donations,
          SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_donations,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_donations,
          SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_donations,
          SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_donations,
          SUM(CASE WHEN status = 'COMPLETED' THEN servings_estimate ELSE 0 END) as total_meals_served
        FROM food_donations
      `);

      const pendingNgos = db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM ngo_profiles WHERE verification_status = 'pending'"
      );

      const categoryBreakdown = db.all(`
        SELECT food_category, COUNT(*) as count, SUM(servings_estimate) as total_servings
        FROM food_donations
        GROUP BY food_category
      `);

      const statusBreakdown = db.all(`
        SELECT status, COUNT(*) as count
        FROM food_donations
        GROUP BY status
      `);

      const recentTrend = db.all(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM food_donations
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      const recentActivity = db.all(`
        SELECT t.*, u.full_name as actor_name, d.title as donation_title
        FROM donation_timeline_events t
        JOIN users u ON t.actor_user_id = u.id
        JOIN food_donations d ON t.donation_id = d.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      const totalMeals = donationCounts ? (donationCounts.total_meals_served || 0) : 0;
      const co2OffsetKg = Math.round(totalMeals * 1.8);

      res.json({
        success: true,
        stats: {
          users: {
            total: userCounts ? userCounts.total_users || 0 : 0,
            donors: userCounts ? userCounts.total_donors || 0 : 0,
            ngos: userCounts ? userCounts.total_ngos || 0 : 0,
            volunteers: userCounts ? userCounts.total_volunteers || 0 : 0,
            pendingNgos: pendingNgos ? pendingNgos.count : 0
          },
          donations: {
            total: donationCounts ? donationCounts.total_donations || 0 : 0,
            active: donationCounts ? donationCounts.active_donations || 0 : 0,
            available: donationCounts ? donationCounts.available_donations || 0 : 0,
            completed: donationCounts ? donationCounts.completed_donations || 0 : 0,
            expired: donationCounts ? donationCounts.expired_donations || 0 : 0,
            cancelled: donationCounts ? donationCounts.cancelled_donations || 0 : 0,
            totalMeals,
            co2OffsetKg
          },
          charts: {
            categoryBreakdown,
            statusBreakdown,
            recentTrend
          },
          recentActivity
        }
      });
    } catch (err) {
      console.error('Admin stats error:', err);
      res.status(500).json({ success: false, message: 'Failed to compute admin statistics.' });
    }
  },

  // 2. Manage Users
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, status, search } = req.query;
      let query = `
        SELECT 
          u.id, u.email, u.full_name, u.phone, u.role, u.status, u.created_at,
          np.organization_name as ngo_name, np.verification_status as ngo_verification,
          dp.organization_name as donor_org, dp.donor_type,
          vp.vehicle_type, vp.total_deliveries_completed
        FROM users u
        LEFT JOIN ngo_profiles np ON u.id = np.user_id
        LEFT JOIN donor_profiles dp ON u.id = dp.user_id
        LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (role && role !== 'all') {
        query += ' AND u.role = ?';
        params.push(role);
      }

      if (status && status !== 'all') {
        query += ' AND u.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (LOWER(u.full_name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.phone) LIKE ?)';
        const s = `%${String(search).toLowerCase().trim()}%`;
        params.push(s, s, s);
      }

      query += ' ORDER BY u.created_at DESC';
      const users = db.all(query, ...params);

      res.json({ success: true, count: users.length, users });
    } catch (err) {
      console.error('Admin get users error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
  },

  // 3. Update User Status
  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const userId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!['active', 'suspended'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status value.' });
        return;
      }

      const user = db.get<any>('SELECT * FROM users WHERE id = ?', userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (user.role === 'admin' && status === 'suspended') {
        res.status(400).json({ success: false, message: 'Super admin accounts cannot be suspended.' });
        return;
      }

      db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', status, userId);

      auditService.log(
        req.user.id,
        status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
        'users',
        userId,
        `Changed status of user ${user.email} (${user.full_name}) to ${status}`
      );

      res.json({ success: true, message: `User account is now ${status}.` });
    } catch (err) {
      console.error('Admin update user status error:', err);
      res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
  },

  // 4. Update NGO Verification Status
  async updateNgoVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const ngoUserId = parseInt(req.params.id, 10);
      const { verification_status, notes } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(verification_status)) {
        res.status(400).json({ success: false, message: 'Invalid verification status.' });
        return;
      }

      const ngoProfile = db.get<any>('SELECT * FROM ngo_profiles WHERE user_id = ?', ngoUserId);
      if (!ngoProfile) {
        res.status(404).json({ success: false, message: 'NGO profile not found.' });
        return;
      }

      db.run(`
        UPDATE ngo_profiles
        SET verification_status = ?, verification_notes = ?
        WHERE user_id = ?
      `, verification_status, notes || null, ngoUserId);

      auditService.log(
        req.user.id,
        'VERIFY_NGO',
        'ngo_profiles',
        ngoProfile.id,
        `Verification updated to ${verification_status} for ${ngoProfile.organization_name}`
      );

      notificationService.create(
        ngoUserId,
        `NGO Verification: ${verification_status.toUpperCase()} 🏛️`,
        verification_status === 'approved'
          ? 'Congratulations! Your NGO registration has been verified and approved. You have full access to food donations.'
          : `Your verification status was updated to ${verification_status}. Reason: ${notes || 'Please contact admin for details.'}`,
        null,
        'verification'
      );

      res.json({ success: true, message: `NGO verification status updated to ${verification_status}.` });
    } catch (err) {
      console.error('Admin update NGO verification error:', err);
      res.status(500).json({ success: false, message: 'Failed to update NGO verification.' });
    }
  },

  // 5. Manage All Donations
  async getDonationsAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      checkAndExpireDonations();

      const { status, category, search } = req.query;
      let query = `
        SELECT 
          d.*,
          u.full_name as donor_name,
          u.email as donor_email,
          dp.organization_name as donor_organization,
          a.full_name as accepted_by_name,
          a.email as accepted_by_email,
          v.full_name as volunteer_name
        FROM food_donations d
        JOIN users u ON d.donor_id = u.id
        LEFT JOIN donor_profiles dp ON u.id = dp.user_id
        LEFT JOIN users a ON d.accepted_by_user_id = a.id
        LEFT JOIN users v ON d.volunteer_id = v.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status && status !== 'all') {
        query += ' AND d.status = ?';
        params.push(status);
      }

      if (category && category !== 'all') {
        query += ' AND d.food_category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (LOWER(d.title) LIKE ? OR LOWER(d.pickup_city) LIKE ? OR LOWER(u.full_name) LIKE ?)';
        const s = `%${String(search).toLowerCase().trim()}%`;
        params.push(s, s, s);
      }

      query += ' ORDER BY d.created_at DESC';
      const donations = db.all(query, ...params);

      res.json({ success: true, count: donations.length, donations });
    } catch (err) {
      console.error('Admin get donations error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
  },

  // 6. Delete Donation
  async deleteDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);

      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      db.run('DELETE FROM food_donations WHERE id = ?', donationId);

      auditService.log(
        req.user.id,
        'DELETE_DONATION',
        'food_donations',
        donationId,
        `Deleted donation #${donationId}: "${donation.title}" by donor #${donation.donor_id}`
      );

      notificationService.create(
        donation.donor_id,
        'Donation Removed by Admin ⚠️',
        `Your donation "${donation.title}" was removed by an administrator for policy/safety review.`,
        null,
        'system'
      );

      res.json({ success: true, message: 'Donation removed successfully.' });
    } catch (err) {
      console.error('Admin delete donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete donation.' });
    }
  },

  // 7. Audit Logs
  async getAuditLogs(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = auditService.getRecentLogs(100);
      res.json({ success: true, logs });
    } catch (err) {
      console.error('Admin audit logs error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
    }
  }
};

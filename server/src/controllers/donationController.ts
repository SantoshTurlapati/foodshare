import { Request, Response } from 'express';
import { z } from 'zod';
import { db, checkAndExpireDonations } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { notificationService } from '../services/notificationService.js';
import { FoodCategory, DietaryType, DonationStatus } from '../types/index.js';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const createDonationSchema = z.object({
  title: z.string().min(3, 'Food title must be at least 3 characters'),
  food_category: z.enum(['cooked_meal', 'raw_grocery', 'bakery', 'packaged', 'fruits_veggies', 'dairy', 'beverages', 'other']),
  dietary_type: z.enum(['veg', 'non_veg', 'vegan']).default('veg'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  quantity_unit: z.string().min(1, 'Quantity unit is required (e.g. kg, meals, boxes)'),
  servings_estimate: z.coerce.number().int().positive('Estimated servings must be at least 1'),
  description: z.string().min(5, 'Please provide a clear description of the food condition and contents'),
  preparation_time: z.string().min(1, 'Preparation date & time is required'),
  expiry_time: z.string().min(1, 'Consume-before date & time is required'),
  pickup_address: z.string().min(3, 'Pickup address is required'),
  pickup_city: z.string().min(2, 'Pickup city is required'),
  pickup_pincode: z.string().min(3, 'Pincode is required'),
  pickup_contact_number: z.string().min(7, 'Contact number is required'),
  pickup_notes: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  image_url: z.string().optional()
});

export const donationController = {
  // 1. Create Donation (Donor)
  async createDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (req.user.role !== 'donor' && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only registered donors can post food donations.' });
        return;
      }

      const parsed = createDonationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
          errors: parsed.error.issues
        });
        return;
      }

      const data = parsed.data;

      // Handle image upload or image_url
      let imageUrl = data.image_url || null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const prepDate = new Date(data.preparation_time);
      const expDate = new Date(data.expiry_time);
      if (expDate <= prepDate) {
        res.status(400).json({ success: false, message: 'Expiry time must be after preparation time.' });
        return;
      }

      const result = db.run(`
        INSERT INTO food_donations (
          donor_id, title, food_category, dietary_type, quantity, quantity_unit,
          servings_estimate, description, preparation_time, expiry_time, image_url,
          pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
          latitude, longitude, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
      `,
        req.user.id,
        data.title.trim(),
        data.food_category,
        data.dietary_type,
        data.quantity,
        data.quantity_unit.trim(),
        data.servings_estimate,
        data.description.trim(),
        data.preparation_time,
        data.expiry_time,
        imageUrl,
        data.pickup_address.trim(),
        data.pickup_city.trim(),
        data.pickup_pincode.trim(),
        data.pickup_contact_number.trim(),
        data.pickup_notes ? data.pickup_notes.trim() : null,
        data.latitude || 37.7749,
        data.longitude || -122.4194
      );

      const donationId = Number(result.lastInsertRowid);

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note)
        VALUES (?, 'POSTED', ?, 'Donation Posted', 'Food donation was posted and made available for collection.', ?)
      `, donationId, req.user.id, `${data.pickup_city}, ${data.pickup_pincode}`);

      notificationService.create(
        req.user.id,
        'Donation Listed Successfully 🍲',
        `Your donation "${data.title}" is now active and visible to nearby verified NGOs and volunteers.`,
        donationId,
        'donation_status'
      );

      const newDonation = db.get('SELECT * FROM food_donations WHERE id = ?', donationId);

      res.status(201).json({
        success: true,
        message: 'Food donation posted successfully!',
        donation: newDonation
      });
    } catch (err) {
      console.error('Create donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to post donation. Please check your data.' });
    }
  },

  // 2. Search and Filter Donations
  async getDonations(req: Request, res: Response): Promise<void> {
    try {
      checkAndExpireDonations();

      const {
        category,
        status,
        dietary,
        city,
        search,
        sort,
        userLat,
        userLng
      } = req.query;

      let query = `
        SELECT 
          d.*,
          u.full_name as donor_name,
          u.phone as donor_phone,
          dp.organization_name as donor_organization,
          dp.donor_type,
          a.full_name as accepted_by_name,
          v.full_name as volunteer_name
        FROM food_donations d
        JOIN users u ON d.donor_id = u.id
        LEFT JOIN donor_profiles dp ON u.id = dp.user_id
        LEFT JOIN users a ON d.accepted_by_user_id = a.id
        LEFT JOIN users v ON d.volunteer_id = v.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category && category !== 'all') {
        query += ' AND d.food_category = ?';
        params.push(category);
      }

      if (status && status !== 'all') {
        query += ' AND d.status = ?';
        params.push(status);
      } else if (!status) {
        query += " AND d.status = 'AVAILABLE'";
      }

      if (dietary && dietary !== 'all') {
        query += ' AND d.dietary_type = ?';
        params.push(dietary);
      }

      if (city) {
        query += ' AND LOWER(d.pickup_city) LIKE ?';
        params.push(`%${String(city).toLowerCase().trim()}%`);
      }

      if (search) {
        query += ' AND (LOWER(d.title) LIKE ? OR LOWER(d.description) LIKE ? OR LOWER(d.pickup_address) LIKE ?)';
        const s = `%${String(search).toLowerCase().trim()}%`;
        params.push(s, s, s);
      }

      if (sort === 'expiring_soon') {
        query += ' ORDER BY d.expiry_time ASC';
      } else if (sort === 'quantity_desc') {
        query += ' ORDER BY d.servings_estimate DESC';
      } else {
        query += ' ORDER BY d.created_at DESC';
      }

      const rows = db.all<any>(query, ...params);

      let donations = rows.map(item => {
        let distanceKm = null;
        if (userLat && userLng && item.latitude && item.longitude) {
          distanceKm = calculateDistance(
            Number(userLat),
            Number(userLng),
            item.latitude,
            item.longitude
          );
        }
        return {
          ...item,
          distance_km: distanceKm
        };
      });

      if (sort === 'nearest' && userLat && userLng) {
        donations.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
      }

      res.json({
        success: true,
        count: donations.length,
        donations
      });
    } catch (err) {
      console.error('Get donations error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
  },

  // 3. Get My Posted Donations (Donor)
  async getMyDonations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      checkAndExpireDonations();

      const donations = db.all(`
        SELECT 
          d.*,
          a.full_name as accepted_by_name,
          a.phone as accepted_by_phone,
          np.organization_name as accepted_ngo_org,
          v.full_name as volunteer_name,
          v.phone as volunteer_phone
        FROM food_donations d
        LEFT JOIN users a ON d.accepted_by_user_id = a.id
        LEFT JOIN ngo_profiles np ON a.id = np.user_id
        LEFT JOIN users v ON d.volunteer_id = v.id
        WHERE d.donor_id = ?
        ORDER BY d.created_at DESC
      `, req.user.id);

      res.json({
        success: true,
        count: donations.length,
        donations
      });
    } catch (err) {
      console.error('Get my donations error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve your donations.' });
    }
  },

  // 4. Get My Tasks (NGO & Volunteer)
  async getMyTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const tasks = db.all(`
        SELECT 
          d.*,
          u.full_name as donor_name,
          u.phone as donor_phone,
          dp.organization_name as donor_organization,
          a.full_name as accepted_by_name,
          v.full_name as volunteer_name
        FROM food_donations d
        JOIN users u ON d.donor_id = u.id
        LEFT JOIN donor_profiles dp ON u.id = dp.user_id
        LEFT JOIN users a ON d.accepted_by_user_id = a.id
        LEFT JOIN users v ON d.volunteer_id = v.id
        WHERE d.accepted_by_user_id = ? OR d.volunteer_id = ?
        ORDER BY d.updated_at DESC
      `, req.user.id, req.user.id);

      res.json({
        success: true,
        count: tasks.length,
        donations: tasks
      });
    } catch (err) {
      console.error('Get my tasks error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
    }
  },

  // 5. Get Donation Details by ID
  async getDonationById(req: Request, res: Response): Promise<void> {
    try {
      const donationId = parseInt(req.params.id, 10);
      if (isNaN(donationId)) {
        res.status(400).json({ success: false, message: 'Invalid donation ID.' });
        return;
      }

      checkAndExpireDonations();

      const donation = db.get<any>(`
        SELECT 
          d.*,
          u.full_name as donor_name,
          u.phone as donor_phone,
          u.email as donor_email,
          dp.organization_name as donor_organization,
          dp.donor_type,
          a.full_name as accepted_by_name,
          a.phone as accepted_by_phone,
          np.organization_name as accepted_ngo_org,
          v.full_name as volunteer_name,
          v.phone as volunteer_phone,
          vp.vehicle_type as volunteer_vehicle
        FROM food_donations d
        JOIN users u ON d.donor_id = u.id
        LEFT JOIN donor_profiles dp ON u.id = dp.user_id
        LEFT JOIN users a ON d.accepted_by_user_id = a.id
        LEFT JOIN ngo_profiles np ON a.id = np.user_id
        LEFT JOIN users v ON d.volunteer_id = v.id
        LEFT JOIN volunteer_profiles vp ON v.id = vp.user_id
        WHERE d.id = ?
      `, donationId);

      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      const timeline = db.all(`
        SELECT t.*, u.full_name as actor_name, u.role as actor_role
        FROM donation_timeline_events t
        JOIN users u ON t.actor_user_id = u.id
        WHERE t.donation_id = ?
        ORDER BY t.created_at ASC
      `, donationId);

      const distribution = db.get(
        'SELECT * FROM distribution_records WHERE donation_id = ?',
        donationId
      );

      const reviews = db.all(`
        SELECT r.*, u.full_name as reviewer_name, u.role as reviewer_role
        FROM feedback_reviews r
        JOIN users u ON r.from_user_id = u.id
        WHERE r.donation_id = ?
      `, donationId);

      res.json({
        success: true,
        donation: {
          ...donation,
          timeline,
          distribution,
          reviews
        }
      });
    } catch (err) {
      console.error('Get donation by id error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve donation details.' });
    }
  },

  // 6. Update Donation
  async updateDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      if (donation.donor_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to edit this donation.' });
        return;
      }

      if (donation.status !== 'AVAILABLE') {
        res.status(400).json({ success: false, message: 'Cannot edit donation after it has been accepted.' });
        return;
      }

      const {
        title, food_category, dietary_type, quantity, quantity_unit,
        servings_estimate, description, pickup_address, pickup_city,
        pickup_pincode, pickup_contact_number, pickup_notes
      } = req.body;

      db.run(`
        UPDATE food_donations
        SET title = COALESCE(?, title),
            food_category = COALESCE(?, food_category),
            dietary_type = COALESCE(?, dietary_type),
            quantity = COALESCE(?, quantity),
            quantity_unit = COALESCE(?, quantity_unit),
            servings_estimate = COALESCE(?, servings_estimate),
            description = COALESCE(?, description),
            pickup_address = COALESCE(?, pickup_address),
            pickup_city = COALESCE(?, pickup_city),
            pickup_pincode = COALESCE(?, pickup_pincode),
            pickup_contact_number = COALESCE(?, pickup_contact_number),
            pickup_notes = COALESCE(?, pickup_notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        title || null,
        food_category || null,
        dietary_type || null,
        quantity || null,
        quantity_unit || null,
        servings_estimate || null,
        description || null,
        pickup_address || null,
        pickup_city || null,
        pickup_pincode || null,
        pickup_contact_number || null,
        pickup_notes || null,
        donationId
      );

      const updated = db.get('SELECT * FROM food_donations WHERE id = ?', donationId);
      res.json({ success: true, message: 'Donation details updated.', donation: updated });
    } catch (err) {
      console.error('Update donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to update donation.' });
    }
  },

  // 7. Cancel Donation
  async cancelDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);
      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.donor_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to cancel this donation.' });
        return;
      }

      if (['COLLECTED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(donation.status)) {
        res.status(400).json({ success: false, message: `Cannot cancel a donation that is already ${donation.status}.` });
        return;
      }

      db.run(`
        UPDATE food_donations
        SET status = 'CANCELLED', cancellation_reason = ?, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, reason || 'Cancelled by donor', donationId);

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description)
        VALUES (?, 'CANCELLED', ?, 'Donation Cancelled', ?)
      `, donationId, req.user.id, reason ? `Reason: ${reason}` : 'Donation was cancelled.');

      if (donation.accepted_by_user_id) {
        notificationService.create(
          donation.accepted_by_user_id,
          'Donation Cancelled ⚠️',
          `Donation #${donationId} (${donation.title}) was cancelled by the donor.`,
          donationId,
          'donation_status'
        );
      }

      res.json({ success: true, message: 'Donation cancelled successfully.' });
    } catch (err) {
      console.error('Cancel donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to cancel donation.' });
    }
  },

  // 8. Accept Donation
  async acceptDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!['ngo', 'volunteer', 'admin'].includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Only registered NGOs and Volunteers can accept donations.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);

      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.status !== 'AVAILABLE') {
        res.status(400).json({ success: false, message: 'This donation has already been accepted or is no longer available.' });
        return;
      }

      const volunteerId = req.user.role === 'volunteer' ? req.user.id : null;

      db.run(`
        UPDATE food_donations
        SET status = 'ACCEPTED',
            accepted_by_user_id = ?,
            volunteer_id = COALESCE(?, volunteer_id),
            accepted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, req.user.id, volunteerId, donationId);

      const actorRoleName = req.user.role === 'ngo' ? 'NGO' : 'Volunteer';
      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description)
        VALUES (?, 'ACCEPTED', ?, 'Donation Accepted', ?)
      `, donationId, req.user.id, `${req.user.full_name} (${actorRoleName}) accepted this donation for distribution.`);

      notificationService.create(
        donation.donor_id,
        'Donation Accepted! 🎉',
        `Great news! ${req.user.full_name} (${actorRoleName}) has accepted your donation "${donation.title}". They will coordinate pickup shortly.`,
        donationId,
        'donation_status'
      );

      res.json({
        success: true,
        message: 'Donation accepted successfully! You can now coordinate pickup.',
        status: 'ACCEPTED'
      });
    } catch (err) {
      console.error('Accept donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to accept donation.' });
    }
  },

  // 9. Assign Pickup
  async assignPickup(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const { volunteer_id, notes, estimated_pickup_time } = req.body;

      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);
      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.accepted_by_user_id !== req.user.id && donation.volunteer_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not assigned to this donation.' });
        return;
      }

      const assignedVolunteerId = volunteer_id ? Number(volunteer_id) : donation.volunteer_id;

      db.run(`
        UPDATE food_donations
        SET status = 'PICKUP_ASSIGNED',
            volunteer_id = ?,
            pickup_assigned_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, assignedVolunteerId, donationId);

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description)
        VALUES (?, 'PICKUP_ASSIGNED', ?, 'Pickup Scheduled & Assigned', ?)
      `, donationId, req.user.id, notes || (estimated_pickup_time ? `Pickup scheduled for ${estimated_pickup_time}` : 'Volunteer is en route for collection.'));

      notificationService.create(
        donation.donor_id,
        'Pickup Scheduled 🚗',
        `A pickup has been scheduled for your donation "${donation.title}". Please keep the food ready for collection.`,
        donationId,
        'donation_status'
      );

      if (assignedVolunteerId && assignedVolunteerId !== req.user.id) {
        notificationService.create(
          assignedVolunteerId,
          'New Pickup Task Assigned 📍',
          `You have been assigned to collect "${donation.title}" from ${donation.pickup_address}, ${donation.pickup_city}.`,
          donationId,
          'assignment'
        );
      }

      res.json({ success: true, message: 'Pickup assigned and scheduled successfully!', status: 'PICKUP_ASSIGNED' });
    } catch (err) {
      console.error('Assign pickup error:', err);
      res.status(500).json({ success: false, message: 'Failed to assign pickup.' });
    }
  },

  // 10. Mark Collected
  async markCollected(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const { notes, photo_url } = req.body;

      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);
      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.accepted_by_user_id !== req.user.id && donation.volunteer_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to update this donation.' });
        return;
      }

      db.run(`
        UPDATE food_donations
        SET status = 'COLLECTED',
            collected_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, donationId);

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, proof_image_url)
        VALUES (?, 'COLLECTED', ?, 'Food Collected from Donor', ?, ?)
      `, donationId, req.user.id, notes || 'Food inspected and collected from donor location in good hygiene condition.', photo_url || null);

      notificationService.create(
        donation.donor_id,
        'Food Collected! ✅',
        `Your food donation "${donation.title}" has been safely collected and is on the way for community distribution.`,
        donationId,
        'donation_status'
      );

      res.json({ success: true, message: 'Donation marked as collected!', status: 'COLLECTED' });
    } catch (err) {
      console.error('Mark collected error:', err);
      res.status(500).json({ success: false, message: 'Failed to update collection status.' });
    }
  },

  // 11. Mark Distributed
  async markDistributed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const donationId = parseInt(req.params.id, 10);
      const { distribution_location, beneficiaries_reached, notes, distribution_photos } = req.body;

      if (!distribution_location || !beneficiaries_reached) {
        res.status(400).json({ success: false, message: 'Please specify distribution location and estimated beneficiaries reached.' });
        return;
      }

      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donationId);
      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.accepted_by_user_id !== req.user.id && donation.volunteer_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to update this donation.' });
        return;
      }

      db.run(`
        UPDATE food_donations
        SET status = 'DISTRIBUTED',
            distributed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, donationId);

      db.run(`
        INSERT INTO distribution_records (donation_id, handler_user_id, distribution_location, beneficiaries_reached, notes, distribution_photos)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(donation_id) DO UPDATE SET
          distribution_location = excluded.distribution_location,
          beneficiaries_reached = excluded.beneficiaries_reached,
          notes = excluded.notes,
          distribution_photos = excluded.distribution_photos
      `, donationId, req.user.id, distribution_location, Number(beneficiaries_reached), notes || null, distribution_photos || null);

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note)
        VALUES (?, 'DISTRIBUTED', ?, 'Food Distributed to Community', ?, ?)
      `, donationId, req.user.id, `Successfully served approx. ${beneficiaries_reached} people. ${notes || ''}`, distribution_location);

      notificationService.create(
        donation.donor_id,
        'Food Distributed Successfully! 🥣',
        `Your donation "${donation.title}" was distributed at ${distribution_location}, reaching ${beneficiaries_reached} people!`,
        donationId,
        'donation_status'
      );

      res.json({ success: true, message: 'Distribution logged successfully!', status: 'DISTRIBUTED' });
    } catch (err) {
      console.error('Mark distributed error:', err);
      res.status(500).json({ success: false, message: 'Failed to record distribution details.' });
    }
  },

  // 12. Complete Donation
  async completeDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      if (donation.donor_id !== req.user.id && donation.accepted_by_user_id !== req.user.id && donation.volunteer_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to complete this donation.' });
        return;
      }

      db.run(`
        UPDATE food_donations
        SET status = 'COMPLETED',
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, donationId);

      if (donation.volunteer_id) {
        db.run(`
          UPDATE volunteer_profiles
          SET total_deliveries_completed = total_deliveries_completed + 1
          WHERE user_id = ?
        `, donation.volunteer_id);
      }

      db.run(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description)
        VALUES (?, 'COMPLETED', ?, 'Donation Cycle Completed', 'The food donation lifecycle is 100% complete. Thank you for making a difference!')
      `, donationId, req.user.id);

      notificationService.create(
        donation.donor_id,
        'Donation Completed! 🌟',
        `Donation #${donationId} is completed! Please take a moment to leave feedback and rating.`,
        donationId,
        'donation_status'
      );

      if (donation.accepted_by_user_id && donation.accepted_by_user_id !== req.user.id) {
        notificationService.create(
          donation.accepted_by_user_id,
          'Donation Completed! 🌟',
          `Donation #${donationId} (${donation.title}) has been marked as fully completed.`,
          donationId,
          'donation_status'
        );
      }

      res.json({ success: true, message: 'Donation lifecycle marked as completed!', status: 'COMPLETED' });
    } catch (err) {
      console.error('Complete donation error:', err);
      res.status(500).json({ success: false, message: 'Failed to complete donation.' });
    }
  }
};

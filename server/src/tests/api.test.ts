import request from 'supertest';
import { createApp } from '../app.js';
import { seedDatabase } from '../db/seed.js';

const app = createApp();

beforeAll(async () => {
  await seedDatabase();
});

describe('FoodShare Full-Stack API Test Suite', () => {
  let donorToken: string;
  let ngoToken: string;
  let volunteerToken: string;
  let adminToken: string;
  let createdDonationId: number;

  // 1. Authentication Tests
  describe('Authentication & RBAC', () => {
    it('should login donor successfully and return token with profile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'donor.sarah@freshbites.com',
          password: 'Donor@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('donor');
      expect(res.body.user.profile).toBeDefined();
      donorToken = res.body.token;
    });

    it('should login NGO successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ngo.hope@feedthecity.org',
          password: 'Ngo@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ngo');
      ngoToken = res.body.token;
    });

    it('should login Volunteer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer.alex@gmail.com',
          password: 'Volunteer@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('volunteer');
      volunteerToken = res.body.token;
    });

    it('should login Admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@foodshare.org',
          password: 'Admin@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'donor.sarah@freshbites.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should register a new donor with validation', async () => {
      const uniqueEmail = `donor.test.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password@123',
          full_name: 'Test Donor Organization',
          phone: '+1 555 123 4567',
          role: 'donor',
          donor_type: 'restaurant',
          organization_name: 'Test Kitchen Cafe',
          address: '100 Main St',
          city: 'San Francisco',
          pincode: '94105'
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(uniqueEmail);
    });
  });

  // 2. Donation Lifecycle State Transitions
  describe('Donation Lifecycle State Machine', () => {
    it('donor can create a food donation (AVAILABLE)', async () => {
      const now = new Date();
      const prepTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
      const expiryTime = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: '30 Hot Vegetable Biryani Meal Packs',
          food_category: 'cooked_meal',
          dietary_type: 'veg',
          quantity: 20,
          quantity_unit: 'kg',
          servings_estimate: 30,
          description: 'Freshly prepared vegetable biryani with raita. Packed into individual eco-friendly boxes.',
          preparation_time: prepTime,
          expiry_time: expiryTime,
          pickup_address: '742 Evergreen Terrace',
          pickup_city: 'San Francisco',
          pickup_pincode: '94103',
          pickup_contact_number: '+1 415 555 2671',
          pickup_notes: 'Ring side bell for kitchen access'
        });

      expect(res.status).toBe(201);
      expect(res.body.donation).toBeDefined();
      expect(res.body.donation.status).toBe('AVAILABLE');
      createdDonationId = res.body.donation.id;
    });

    it('donor cannot accept own donation (role restriction)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(403);
    });

    it('NGO can accept available donation (AVAILABLE -> ACCEPTED)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/accept`)
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACCEPTED');
    });

    it('cannot re-accept an already ACCEPTED donation', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/accept`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(400);
    });

    it('NGO can assign pickup schedule (ACCEPTED -> PICKUP_ASSIGNED)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/assign-pickup`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({
          notes: 'Pickup vehicle dispatched for 4:00 PM collection.'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PICKUP_ASSIGNED');
    });

    it('NGO/Volunteer can mark food collected (PICKUP_ASSIGNED -> COLLECTED)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/collect`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({
          notes: 'Collected 30 biryani meal packs in insulated food carrier.'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COLLECTED');
    });

    it('NGO can record distribution (COLLECTED -> DISTRIBUTED)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/distribute`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({
          distribution_location: 'Mission Community Center, 16th St',
          beneficiaries_reached: 30,
          notes: 'Distributed to 30 families at the evening community meal program.'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('DISTRIBUTED');
    });

    it('can complete donation cycle (DISTRIBUTED -> COMPLETED)', async () => {
      const res = await request(app)
        .post(`/api/donations/${createdDonationId}/complete`)
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });

    it('donor can submit feedback for completed donation', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          donation_id: createdDonationId,
          rating: 5,
          comment: 'Quick and professional pickup! Glad the food reached families in need.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects duplicate review for same donation from same user', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          donation_id: createdDonationId,
          rating: 4,
          comment: 'Another comment.'
        });

      expect(res.status).toBe(409);
    });
  });

  // 3. Admin Portal Tests
  describe('Admin Portal Features', () => {
    it('admin can fetch system stats & charts', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.users.total).toBeGreaterThan(0);
      expect(res.body.stats.donations.total).toBeGreaterThan(0);
      expect(res.body.stats.charts.categoryBreakdown).toBeDefined();
    });

    it('non-admin is blocked from admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(403);
    });

    it('admin can list all users and update NGO verification status', async () => {
      const usersRes = await request(app)
        .get('/api/admin/users?role=ngo')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(usersRes.status).toBe(200);
      expect(usersRes.body.users.length).toBeGreaterThan(0);

      const targetNgo = usersRes.body.users.find((u: any) => u.ngo_verification === 'pending');
      if (targetNgo) {
        const verifyRes = await request(app)
          .put(`/api/admin/ngo/${targetNgo.id}/verification`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            verification_status: 'approved',
            notes: 'Verified against state NGO registration records.'
          });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.success).toBe(true);
      }
    });
  });

  // 4. Notifications Test
  describe('In-App Notification Flow', () => {
    it('donor has received notifications for status updates', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeGreaterThan(0);
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });
});

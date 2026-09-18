import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../config/database.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { notificationService } from '../services/notificationService.js';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  role: z.enum(['donor', 'ngo', 'volunteer', 'admin']),
  // Donor fields
  donor_type: z.enum(['individual', 'restaurant', 'caterer', 'supermarket', 'corporate']).optional(),
  organization_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // NGO fields
  registration_number: z.string().optional(),
  fcra_number: z.string().optional(),
  established_year: z.number().optional(),
  service_areas: z.string().optional(),
  beneficiary_count_estimate: z.number().optional(),
  // Volunteer fields
  vehicle_type: z.enum(['bike', 'car', 'van', 'none']).optional(),
  service_radius_km: z.number().optional(),
});

function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, { expiresIn: '7d' });
}

function getUserProfile(userId: number, role: string) {
  let profile = null;
  if (role === 'donor') {
    profile = db.get('SELECT * FROM donor_profiles WHERE user_id = ?', userId);
  } else if (role === 'ngo') {
    profile = db.get('SELECT * FROM ngo_profiles WHERE user_id = ?', userId);
  } else if (role === 'volunteer') {
    profile = db.get('SELECT * FROM volunteer_profiles WHERE user_id = ?', userId);
  }
  return profile;
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0].message,
          errors: parsed.error.issues
        });
        return;
      }

      const data = parsed.data;

      // Check email uniqueness
      const existing = db.get('SELECT id FROM users WHERE email = ?', data.email.toLowerCase().trim());
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(data.password, salt);

      const userStatus = 'active';
      const ngoVerification = data.role === 'ngo' ? 'approved' : 'approved';

      const userInsert = db.run(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        data.email.toLowerCase().trim(),
        password_hash,
        data.full_name.trim(),
        data.phone.trim(),
        data.role,
        userStatus
      );

      const userId = Number(userInsert.lastInsertRowid);

      // Create role specific profile
      if (data.role === 'donor') {
        db.run(
          `INSERT INTO donor_profiles (user_id, donor_type, organization_name, address, city, pincode, latitude, longitude, default_contact)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          userId,
          data.donor_type || 'individual',
          data.organization_name || null,
          data.address || 'Not specified',
          data.city || 'San Francisco',
          data.pincode || '94103',
          data.latitude || 37.7749,
          data.longitude || -122.4194,
          data.phone
        );
      } else if (data.role === 'ngo') {
        db.run(
          `INSERT INTO ngo_profiles (user_id, organization_name, registration_number, fcra_number, established_year, address, city, pincode, service_areas, verification_status, beneficiary_count_estimate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          userId,
          data.organization_name || data.full_name,
          data.registration_number || `REG-${Date.now().toString().slice(-6)}`,
          data.fcra_number || null,
          data.established_year || new Date().getFullYear(),
          data.address || 'Main Office',
          data.city || 'San Francisco',
          data.pincode || '94105',
          data.service_areas || 'City-wide',
          ngoVerification,
          data.beneficiary_count_estimate || 250
        );
      } else if (data.role === 'volunteer') {
        db.run(
          `INSERT INTO volunteer_profiles (user_id, vehicle_type, service_radius_km, city, pincode, availability_status)
           VALUES (?, ?, ?, ?, ?, 'available')`,
          userId,
          data.vehicle_type || 'bike',
          data.service_radius_km || 15.0,
          data.city || 'San Francisco',
          data.pincode || '94103'
        );
      }

      // Welcome notification
      notificationService.create(
        userId,
        'Welcome to FoodShare! 🌟',
        `Thank you for joining our mission to eliminate hunger and reduce food waste as a ${data.role.toUpperCase()}.`,
        null,
        'system'
      );

      const user = db.get<any>('SELECT id, email, full_name, phone, role, status, created_at FROM users WHERE id = ?', userId);
      const profile = getUserProfile(userId, data.role);
      const token = generateToken(userId);

      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          ...user,
          profile
        }
      });
    } catch (err: any) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Registration failed. Please check your details and try again.' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please enter both email and password.' });
        return;
      }

      const user = db.get<any>(
        'SELECT id, email, password_hash, full_name, phone, role, status, avatar_url, created_at FROM users WHERE email = ?',
        email.toLowerCase().trim()
      );

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ success: false, message: 'This account has been suspended. Please contact admin support.' });
        return;
      }

      const profile = getUserProfile(user.id, user.role);
      const token = generateToken(user.id);

      const { password_hash, ...safeUser } = user;

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          ...safeUser,
          profile
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'An error occurred during login. Please try again.' });
    }
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = db.get<any>(
        'SELECT id, email, full_name, phone, role, status, avatar_url, created_at FROM users WHERE id = ?',
        req.user.id
      );

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const profile = getUserProfile(user.id, user.role);
      const unreadRow = db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        user.id
      );

      res.json({
        success: true,
        user: {
          ...user,
          profile,
          unreadNotificationsCount: unreadRow ? unreadRow.count : 0
        }
      });
    } catch (err) {
      console.error('Me error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user session.' });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const { full_name, phone, avatar_url, ...profileData } = req.body;
      const userId = req.user.id;

      if (full_name || phone || avatar_url !== undefined) {
        db.run(
          `UPDATE users
           SET full_name = COALESCE(?, full_name),
               phone = COALESCE(?, phone),
               avatar_url = COALESCE(?, avatar_url),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          full_name || null,
          phone || null,
          avatar_url || null,
          userId
        );
      }

      if (req.user.role === 'donor') {
        db.run(
          `UPDATE donor_profiles
           SET donor_type = COALESCE(?, donor_type),
               organization_name = COALESCE(?, organization_name),
               address = COALESCE(?, address),
               city = COALESCE(?, city),
               pincode = COALESCE(?, pincode),
               latitude = COALESCE(?, latitude),
               longitude = COALESCE(?, longitude)
           WHERE user_id = ?`,
          profileData.donor_type || null,
          profileData.organization_name || null,
          profileData.address || null,
          profileData.city || null,
          profileData.pincode || null,
          profileData.latitude || null,
          profileData.longitude || null,
          userId
        );
      } else if (req.user.role === 'ngo') {
        db.run(
          `UPDATE ngo_profiles
           SET organization_name = COALESCE(?, organization_name),
               registration_number = COALESCE(?, registration_number),
               address = COALESCE(?, address),
               city = COALESCE(?, city),
               pincode = COALESCE(?, pincode),
               service_areas = COALESCE(?, service_areas),
               beneficiary_count_estimate = COALESCE(?, beneficiary_count_estimate)
           WHERE user_id = ?`,
          profileData.organization_name || null,
          profileData.registration_number || null,
          profileData.address || null,
          profileData.city || null,
          profileData.pincode || null,
          profileData.service_areas || null,
          profileData.beneficiary_count_estimate || null,
          userId
        );
      } else if (req.user.role === 'volunteer') {
        db.run(
          `UPDATE volunteer_profiles
           SET vehicle_type = COALESCE(?, vehicle_type),
               service_radius_km = COALESCE(?, service_radius_km),
               city = COALESCE(?, city),
               pincode = COALESCE(?, pincode),
               availability_status = COALESCE(?, availability_status)
           WHERE user_id = ?`,
          profileData.vehicle_type || null,
          profileData.service_radius_km || null,
          profileData.city || null,
          profileData.pincode || null,
          profileData.availability_status || null,
          userId
        );
      }

      const updatedUser = db.get<any>(
        'SELECT id, email, full_name, phone, role, status, avatar_url, updated_at FROM users WHERE id = ?',
        userId
      );
      const profile = getUserProfile(userId, req.user.role);

      res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          ...updatedUser,
          profile
        }
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
        return;
      }

      const user = db.get<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', newHash, req.user.id);

      res.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
  }
};

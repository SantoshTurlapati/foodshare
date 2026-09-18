import { Response } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { notificationService } from '../services/notificationService.js';

const feedbackSchema = z.object({
  donation_id: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional()
});

export const feedbackController = {
  async submitFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.issues[0].message });
        return;
      }

      const { donation_id, rating, comment } = parsed.data;

      const donation = db.get<any>('SELECT * FROM food_donations WHERE id = ?', donation_id);
      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation not found.' });
        return;
      }

      if (donation.status !== 'COMPLETED') {
        res.status(400).json({ success: false, message: 'Feedback can only be provided for completed donations.' });
        return;
      }

      let toUserId: number | null = null;
      if (req.user.id === donation.donor_id) {
        toUserId = donation.accepted_by_user_id || donation.volunteer_id;
      } else if (req.user.id === donation.accepted_by_user_id || req.user.id === donation.volunteer_id) {
        toUserId = donation.donor_id;
      }

      if (!toUserId) {
        res.status(403).json({ success: false, message: 'You were not a participant in this donation.' });
        return;
      }

      const existing = db.get(
        'SELECT id FROM feedback_reviews WHERE donation_id = ? AND from_user_id = ?',
        donation_id,
        req.user.id
      );

      if (existing) {
        res.status(409).json({ success: false, message: 'You have already submitted feedback for this donation.' });
        return;
      }

      db.run(`
        INSERT INTO feedback_reviews (donation_id, from_user_id, to_user_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `, donation_id, req.user.id, toUserId, rating, comment ? comment.trim() : null);

      notificationService.create(
        toUserId,
        'New Feedback Received ⭐',
        `${req.user.full_name} gave you a ${rating}-star rating for donation #${donation_id}.`,
        donation_id,
        'system'
      );

      res.status(201).json({ success: true, message: 'Thank you! Your feedback has been recorded.' });
    } catch (err) {
      console.error('Submit feedback error:', err);
      res.status(500).json({ success: false, message: 'Failed to record feedback.' });
    }
  },

  async getDonationReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const donationId = parseInt(req.params.donationId, 10);
      const reviews = db.all(`
        SELECT r.*, u.full_name as reviewer_name, u.role as reviewer_role
        FROM feedback_reviews r
        JOIN users u ON r.from_user_id = u.id
        WHERE r.donation_id = ?
        ORDER BY r.created_at DESC
      `, donationId);

      res.json({ success: true, reviews });
    } catch (err) {
      console.error('Get reviews error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
  }
};

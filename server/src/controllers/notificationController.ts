import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const data = notificationService.getUserNotifications(req.user.id);
      res.json({ success: true, ...data });
    } catch (err) {
      console.error('Get notifications error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const notifId = parseInt(req.params.id, 10);
      notificationService.markAsRead(notifId, req.user.id);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err) {
      console.error('Mark read error:', err);
      res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  },

  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const count = notificationService.markAllAsRead(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read.', updated: count });
    } catch (err) {
      console.error('Mark all read error:', err);
      res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
  }
};

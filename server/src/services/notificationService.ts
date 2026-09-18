import { db } from '../config/database.js';
import { NotificationItem } from '../types/index.js';

export const notificationService = {
  create(userId: number, title: string, message: string, donationId?: number | null, type: 'donation_status' | 'verification' | 'system' | 'assignment' = 'donation_status'): NotificationItem {
    const res = db.run(
      `INSERT INTO notifications (user_id, donation_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, 0)`,
      userId,
      donationId || null,
      title,
      message,
      type
    );

    const notif = db.get<NotificationItem>(
      'SELECT * FROM notifications WHERE id = ?',
      Number(res.lastInsertRowid)
    );
    return notif!;
  },

  getUserNotifications(userId: number): { notifications: NotificationItem[]; unreadCount: number } {
    const notifications = db.all<NotificationItem>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      userId
    );
    const countRow = db.get<{ unread: number }>(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0',
      userId
    );
    return {
      notifications,
      unreadCount: countRow ? countRow.unread : 0
    };
  },

  markAsRead(notificationId: number, userId: number): boolean {
    const res = db.run(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      notificationId,
      userId
    );
    return Number(res.changes) > 0;
  },

  markAllAsRead(userId: number): number {
    const res = db.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      userId
    );
    return Number(res.changes);
  }
};

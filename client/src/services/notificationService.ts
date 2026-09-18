import { api } from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id: number): Promise<any> {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<any> {
    const res = await api.put('/notifications/read-all');
    return res.data;
  }
};

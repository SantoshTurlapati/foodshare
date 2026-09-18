import { api } from './api';
import { AdminStats, User, FoodDonation } from '../types';

export const adminService = {
  async getStats(): Promise<{ stats: AdminStats }> {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getUsers(params: { role?: string; status?: string; search?: string } = {}): Promise<{ count: number; users: User[] }> {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id: number, status: 'active' | 'suspended'): Promise<any> {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  async updateNgoVerification(id: number, verification_status: 'approved' | 'rejected' | 'pending', notes?: string): Promise<any> {
    const res = await api.put(`/admin/ngo/${id}/verification`, { verification_status, notes });
    return res.data;
  },

  async getDonations(params: { status?: string; category?: string; search?: string } = {}): Promise<{ count: number; donations: FoodDonation[] }> {
    const res = await api.get('/admin/donations', { params });
    return res.data;
  },

  async deleteDonation(id: number): Promise<any> {
    const res = await api.delete(`/admin/donations/${id}`);
    return res.data;
  },

  async getAuditLogs(): Promise<{ logs: any[] }> {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  }
};

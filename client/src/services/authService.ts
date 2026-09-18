import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: any): Promise<{ user: User }> {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  }
};

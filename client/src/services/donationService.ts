import { api } from './api';
import { FoodDonation } from '../types';

export interface DonationFilters {
  category?: string;
  status?: string;
  dietary?: string;
  city?: string;
  search?: string;
  sort?: string;
  userLat?: number;
  userLng?: number;
}

export const donationService = {
  async getDonations(filters: DonationFilters = {}): Promise<{ count: number; donations: FoodDonation[] }> {
    const res = await api.get('/donations', { params: filters });
    return res.data;
  },

  async getMyDonations(): Promise<{ count: number; donations: FoodDonation[] }> {
    const res = await api.get('/donations/my-donations');
    return res.data;
  },

  async getMyTasks(): Promise<{ count: number; donations: FoodDonation[] }> {
    const res = await api.get('/donations/my-tasks');
    return res.data;
  },

  async getDonationById(id: number | string): Promise<{ donation: FoodDonation }> {
    const res = await api.get(`/donations/${id}`);
    return res.data;
  },

  async createDonation(formData: FormData): Promise<{ donation: FoodDonation }> {
    const res = await api.post('/donations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async updateDonation(id: number | string, data: any): Promise<{ donation: FoodDonation }> {
    const res = await api.put(`/donations/${id}`, data);
    return res.data;
  },

  async cancelDonation(id: number | string, reason?: string): Promise<any> {
    const res = await api.post(`/donations/${id}/cancel`, { reason });
    return res.data;
  },

  async acceptDonation(id: number | string): Promise<any> {
    const res = await api.post(`/donations/${id}/accept`);
    return res.data;
  },

  async assignPickup(id: number | string, data: { volunteer_id?: number; notes?: string; estimated_pickup_time?: string }): Promise<any> {
    const res = await api.post(`/donations/${id}/assign-pickup`, data);
    return res.data;
  },

  async markCollected(id: number | string, data: { notes?: string; photo_url?: string } = {}): Promise<any> {
    const res = await api.post(`/donations/${id}/collect`, data);
    return res.data;
  },

  async markDistributed(id: number | string, data: { distribution_location: string; beneficiaries_reached: number; notes?: string }): Promise<any> {
    const res = await api.post(`/donations/${id}/distribute`, data);
    return res.data;
  },

  async completeDonation(id: number | string): Promise<any> {
    const res = await api.post(`/donations/${id}/complete`);
    return res.data;
  }
};

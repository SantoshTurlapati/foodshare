import { api } from './api';
import { FeedbackReview } from '../types';

export const feedbackService = {
  async submitFeedback(data: { donation_id: number; rating: number; comment?: string }): Promise<any> {
    const res = await api.post('/feedback', data);
    return res.data;
  },

  async getDonationReviews(donationId: number): Promise<{ reviews: FeedbackReview[] }> {
    const res = await api.get(`/feedback/donation/${donationId}`);
    return res.data;
  }
};

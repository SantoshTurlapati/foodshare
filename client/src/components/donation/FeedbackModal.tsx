import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { feedbackService } from '../../services/feedbackService';
import { Star, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: number;
  partnerName?: string;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  donationId,
  partnerName = 'Partner Organization',
  onSuccess
}) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await feedbackService.submitFeedback({
        donation_id: donationId,
        rating,
        comment: comment.trim() || undefined
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      success('Thank you for rating your donation partner!');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Partner Feedback"
      subtitle={`Rate your experience working with ${partnerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-center">
        {/* Star Selector */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">How was your donation experience?</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-125 transition"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-amber-600 mt-2">
            {rating === 5 && '⭐️ Exceptional Collaboration!'}
            {rating === 4 && '⭐️ Very Good & Professional'}
            {rating === 3 && '⭐️ Satisfactory'}
            {rating === 2 && '⭐️ Needs Improvement'}
            {rating === 1 && '⭐️ Poor Experience'}
          </p>
        </div>

        {/* Comment */}
        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Comments & Testimonial (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about packaging quality, punctuality, coordination, and community appreciation..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Skip / Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Feedback
          </button>
        </div>
      </form>
    </Modal>
  );
};

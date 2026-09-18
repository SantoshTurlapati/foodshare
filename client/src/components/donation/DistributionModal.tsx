import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import { Users, MapPin, CheckCircle } from 'lucide-react';

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: number;
  defaultServings?: number;
  onSuccess: () => void;
}

export const DistributionModal: React.FC<DistributionModalProps> = ({
  isOpen,
  onClose,
  donationId,
  defaultServings = 50,
  onSuccess
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Downtown Community Outreach Center & Shelter');
  const [beneficiaries, setBeneficiaries] = useState(defaultServings.toString());
  const [notes, setNotes] = useState('Hot meals served fresh to shelter residents and community members.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !beneficiaries) {
      error('Please provide distribution location and beneficiary count.');
      return;
    }

    try {
      setLoading(true);
      await donationService.markDistributed(donationId, {
        distribution_location: location.trim(),
        beneficiaries_reached: parseInt(beneficiaries, 10),
        notes: notes.trim()
      });
      success('Distribution successfully recorded and verified!');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to record distribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Community Distribution"
      subtitle="Log transparent delivery details & beneficiary impact"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            Distribution Location / Center *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. St. Anthony Dining Hall, Golden Gate Ave"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Total Beneficiaries Fed *
          </label>
          <input
            type="number"
            min="1"
            required
            value={beneficiaries}
            onChange={(e) => setBeneficiaries(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-purple-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Distribution Notes & Beneficiary Feedback
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe community response, meal program details, etc."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Save Distribution Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

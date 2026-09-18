import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import { Truck, Clock, Calendar } from 'lucide-react';

interface PickupScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: number;
  onSuccess: () => void;
}

export const PickupScheduleModal: React.FC<PickupScheduleModalProps> = ({
  isOpen,
  onClose,
  donationId,
  onSuccess
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('Volunteer vehicle dispatched for immediate collection.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await donationService.assignPickup(donationId, {
        notes,
        estimated_pickup_time: time || undefined
      });
      success('Pickup scheduled and assigned successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to schedule pickup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule & Assign Pickup"
      subtitle="Coordinate logistics for collecting the food donation"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Estimated Arrival / Pickup Time
          </label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Logistics & Transport Instructions
          </label>
          <textarea
            rows={3}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Volunteer Alex en route via Bike Courier with thermal food bag."
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
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            Confirm Pickup Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
};

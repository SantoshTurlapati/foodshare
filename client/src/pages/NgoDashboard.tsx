import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationService } from '../services/donationService';
import { FoodDonation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PickupScheduleModal } from '../components/donation/PickupScheduleModal';
import { DistributionModal } from '../components/donation/DistributionModal';
import { FeedbackModal } from '../components/donation/FeedbackModal';
import { formatDate, formatTimeAgo } from '../../src/utils/formatters';
import { 
  Building2, 
  Search, 
  Truck, 
  PackageCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Utensils, 
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal handlers
  const [pickupModalDonationId, setPickupModalDonationId] = useState<number | null>(null);
  const [distributeModalDonation, setDistributeModalDonation] = useState<FoodDonation | null>(null);
  const [feedbackDonationId, setFeedbackDonationId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await donationService.getMyTasks();
      setTasks(res.donations);
    } catch (err) {
      console.error('Fetch NGO tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMarkCollected = async (id: number) => {
    try {
      await donationService.markCollected(id, {
        notes: 'Food inspected and collected by NGO team in good condition.'
      });
      success('Donation marked as collected!');
      fetchTasks();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update collection.');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await donationService.completeDonation(id);
      success('Donation cycle marked as 100% completed!');
      fetchTasks();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to complete donation.');
    }
  };

  // Aggregates
  const totalClaimed = tasks.length;
  const inProgress = tasks.filter((t) => ['ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED'].includes(t.status));
  const completed = tasks.filter((t) => t.status === 'COMPLETED');
  const totalBeneficiaries = tasks.reduce((sum, t) => sum + (t.servings_estimate || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user?.profile?.organization_name || 'Verified NGO Relief Portal'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            NGO Redistribution Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Manage food claims, schedule pickups, coordinate volunteer routes, and verify distribution records.
          </p>
        </div>

        <Link
          to="/donations"
          className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 transition flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Food</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims</span>
          <p className="text-2xl font-extrabold text-slate-900">{totalClaimed}</p>
          <p className="text-[11px] text-slate-500">Claimed food rescues</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Operations</span>
          <p className="text-2xl font-extrabold text-indigo-600">{inProgress.length}</p>
          <p className="text-[11px] text-slate-500">In pickup or distribution</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Cycles</span>
          <p className="text-2xl font-extrabold text-emerald-600">{completed.length}</p>
          <p className="text-[11px] text-slate-500">Fully distributed & verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beneficiaries Fed</span>
          <p className="text-2xl font-extrabold text-purple-600">~{totalBeneficiaries}</p>
          <p className="text-[11px] text-slate-500">Meals served in shelters</p>
        </div>
      </div>

      {/* Main Operations List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Task Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage the complete redistribution flow for claimed food donations</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {tasks.length} Total Records
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
              🏛️
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Claimed Donations Yet</h4>
            <p className="text-xs text-slate-500">
              Browse available food postings in your service area and claim them for distribution.
            </p>
            <Link
              to="/donations"
              className="inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Explore Feed
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} size="sm" />
                    <span className="text-xs font-bold text-slate-400">#{task.id}</span>
                    <span className="text-xs font-bold text-slate-900">{task.title}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-brand-600" />
                      <span>{task.quantity} {task.quantity_unit} (~{task.servings_estimate} Servings)</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{task.pickup_address}, {task.pickup_city}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Updated {formatTimeAgo(task.updated_at)}</span>
                    </div>
                  </div>

                  {task.donor_name && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Donor: <span className="font-bold text-slate-700">{task.donor_organization || task.donor_name}</span> (Phone: {task.pickup_contact_number})
                    </p>
                  )}
                </div>

                {/* Right Lifecycle Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                  <Link
                    to={`/donations/${task.id}`}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    View Details
                  </Link>

                  {task.status === 'ACCEPTED' && (
                    <button
                      onClick={() => setPickupModalDonationId(task.id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Schedule Pickup</span>
                    </button>
                  )}

                  {task.status === 'PICKUP_ASSIGNED' && (
                    <button
                      onClick={() => handleMarkCollected(task.id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Confirm Food Collected</span>
                    </button>
                  )}

                  {task.status === 'COLLECTED' && (
                    <button
                      onClick={() => setDistributeModalDonation(task)}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Log Distribution</span>
                    </button>
                  )}

                  {task.status === 'DISTRIBUTED' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Donation</span>
                    </button>
                  )}

                  {task.status === 'COMPLETED' && (
                    <button
                      onClick={() => setFeedbackDonationId(task.id)}
                      className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Rate Donor</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickup Modal */}
      {pickupModalDonationId && (
        <PickupScheduleModal
          isOpen={true}
          donationId={pickupModalDonationId}
          onClose={() => setPickupModalDonationId(null)}
          onSuccess={() => fetchTasks()}
        />
      )}

      {/* Distribution Modal */}
      {distributeModalDonation && (
        <DistributionModal
          isOpen={true}
          donationId={distributeModalDonation.id}
          defaultServings={distributeModalDonation.servings_estimate}
          onClose={() => setDistributeModalDonation(null)}
          onSuccess={() => fetchTasks()}
        />
      )}

      {/* Feedback Modal */}
      {feedbackDonationId && (
        <FeedbackModal
          isOpen={true}
          donationId={feedbackDonationId}
          onClose={() => setFeedbackDonationId(null)}
          onSuccess={() => fetchTasks()}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donationService } from '../services/donationService';
import { FoodDonation } from '../types';
import { DonationCard } from '../components/donation/DonationCard';
import { DonationFormModal } from '../components/donation/DonationFormModal';
import { FeedbackModal } from '../components/donation/FeedbackModal';
import { 
  PlusCircle, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  XCircle, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get('action') === 'new';

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const [isNewModalOpen, setIsNewModalOpen] = useState(shouldOpenNew);
  const [feedbackDonationId, setFeedbackDonationId] = useState<number | null>(null);

  const fetchMyDonations = async () => {
    try {
      setLoading(true);
      const res = await donationService.getMyDonations();
      setDonations(res.donations);
    } catch (err) {
      console.error('Fetch my donations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  // Compute metrics
  const totalDonations = donations.length;
  const activeDonations = donations.filter((d) => ['AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED'].includes(d.status));
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED');
  const cancelledOrExpired = donations.filter((d) => ['CANCELLED', 'EXPIRED'].includes(d.status));
  const totalMealsFed = completedDonations.reduce((sum, d) => sum + (d.servings_estimate || 0), 0);
  const co2PreventedKg = Math.round(totalMealsFed * 1.8);

  const filteredDonations = donations.filter((d) => {
    if (activeTab === 'active') return ['AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED'].includes(d.status);
    if (activeTab === 'completed') return d.status === 'COMPLETED';
    if (activeTab === 'cancelled') return ['CANCELLED', 'EXPIRED'].includes(d.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-800 via-emerald-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user?.profile?.organization_name || 'Donor Partner Profile'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your posted food donations, monitor NGO pickups in real-time, and view verified community social impact.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="z-10 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-105 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Donate Food Now</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Donated</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalDonations}</p>
          <p className="text-[11px] text-slate-500 font-medium">All lifecycle postings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active In-Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{activeDonations.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Available or being collected</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rescued Meals</span>
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-700">{totalMealsFed}</p>
          <p className="text-[11px] text-slate-500 font-medium">People fed in shelters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Offset</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700">{co2PreventedKg} kg</p>
          <p className="text-[11px] text-slate-500 font-medium">Landfill CO₂ avoided</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Postings ({donations.length})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Pipeline ({activeDonations.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'completed'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed ({completedDonations.length})
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancelled / Expired ({cancelledOrExpired.length})
          </button>
        </div>
      </div>

      {/* Donations Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🌱
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Donations in this Tab</h3>
          <p className="text-xs text-slate-500">
            You haven't posted any donations matching this filter yet.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
          >
            Post a Food Donation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((d) => (
            <DonationCard key={d.id} donation={d} />
          ))}
        </div>
      )}

      {/* Post Donation Modal */}
      <DonationFormModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => fetchMyDonations()}
      />

      {/* Optional Feedback Modal for completed donations */}
      {feedbackDonationId && (
        <FeedbackModal
          isOpen={true}
          donationId={feedbackDonationId}
          onClose={() => setFeedbackDonationId(null)}
          onSuccess={() => fetchMyDonations()}
        />
      )}
    </div>
  );
};

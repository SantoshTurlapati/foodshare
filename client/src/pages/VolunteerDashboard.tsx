import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationService } from '../services/donationService';
import { FoodDonation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { DistributionModal } from '../components/donation/DistributionModal';
import { FeedbackModal } from '../components/donation/FeedbackModal';
import { formatDate, formatTimeAgo } from '../../src/utils/formatters';
import { 
  Bike, 
  MapPin, 
  Clock, 
  PackageCheck, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Utensils, 
  ShieldCheck,
  Search,
  Users,
  Star
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const [distributeModalDonation, setDistributeModalDonation] = useState<FoodDonation | null>(null);
  const [feedbackDonationId, setFeedbackDonationId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await donationService.getMyTasks();
      setTasks(res.donations);
    } catch (err) {
      console.error('Fetch volunteer tasks error:', err);
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
        notes: 'Volunteer collected and verified food packages from donor address.'
      });
      success('Pickup confirmed! You are now en route for distribution.');
      fetchTasks();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update collection.');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await donationService.completeDonation(id);
      success('Delivery completed! Great work hero.');
      fetchTasks();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to complete task.');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const activeTasks = tasks.filter((t) => ['ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED'].includes(t.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Volunteer Hero */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
            <Bike className="w-3.5 h-3.5" />
            <span>Active Community Courier • {user?.profile?.vehicle_type?.toUpperCase() || 'BIKE'}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Volunteer Mission Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You are the vital bridge between surplus kitchens and local shelters. Thank you for your service!
          </p>
        </div>

        <Link
          to="/donations"
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-400/30 hover:scale-105 transition flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Claim Food Pickups</span>
        </Link>
      </div>

      {/* Gamification Badges Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Drops</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{completedCount + (user?.profile?.total_deliveries_completed || 0)}</p>
          <p className="text-[11px] text-slate-500">Verified safe deliveries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Route</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{activeTasks.length}</p>
          <p className="text-[11px] text-slate-500">Pickups currently assigned</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Honor Badge</span>
            <Award className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-sm font-extrabold text-brand-700">Hunger Relief Champion</p>
          <p className="text-[11px] text-slate-500">Top 5% volunteer rank</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Service Radius</span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{user?.profile?.service_radius_km || 15} km</p>
          <p className="text-[11px] text-slate-500">San Francisco coverage</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Route & Delivery Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step pickup and drop-off verification</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {tasks.length} Assigned
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
              🚴
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Active Route Tasks</h4>
            <p className="text-xs text-slate-500">
              Claim available food donations from nearby kitchens to start your delivery route.
            </p>
            <Link
              to="/donations"
              className="inline-block px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition"
            >
              Find Available Pickups
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} size="sm" />
                    <span className="text-xs font-bold text-slate-900">{task.title}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      <span>{task.quantity} {task.quantity_unit} (~{task.servings_estimate} Servings)</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{task.pickup_address}, {task.pickup_city}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Donor: <span className="font-bold text-slate-700">{task.donor_organization || task.donor_name}</span> (Contact: {task.pickup_contact_number})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                  <Link
                    to={`/donations/${task.id}`}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    View Map Route
                  </Link>

                  {['ACCEPTED', 'PICKUP_ASSIGNED'].includes(task.status) && (
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
                      <span>Complete Task</span>
                    </button>
                  )}

                  {task.status === 'COMPLETED' && (
                    <button
                      onClick={() => setFeedbackDonationId(task.id)}
                      className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Leave Feedback</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {distributeModalDonation && (
        <DistributionModal
          isOpen={true}
          donationId={distributeModalDonation.id}
          defaultServings={distributeModalDonation.servings_estimate}
          onClose={() => setDistributeModalDonation(null)}
          onSuccess={() => fetchTasks()}
        />
      )}

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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { FoodDonation } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { DonationTimeline } from '../components/donation/DonationTimeline';
import { PickupScheduleModal } from '../components/donation/PickupScheduleModal';
import { DistributionModal } from '../components/donation/DistributionModal';
import { FeedbackModal } from '../components/donation/FeedbackModal';
import { formatDate, formatTimeAgo, formatCategoryName, isDateExpired } from '../utils/formatters';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  Utensils, 
  Users, 
  Phone, 
  Mail, 
  Truck, 
  PackageCheck, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Star, 
  ArrowLeft,
  Share2,
  Navigation
} from 'lucide-react';

export const DonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<FoodDonation | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDonation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await donationService.getDonationById(id);
      setDonation(res.donation);
    } catch (err: any) {
      error('Donation not found or server error.');
      navigate('/donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const handleClaim = async () => {
    if (!isAuthenticated) {
      error('Please log in to claim donations.');
      navigate('/login');
      return;
    }
    if (!donation) return;

    try {
      await donationService.acceptDonation(donation.id);
      success('Donation claimed! You can now arrange pickup.');
      fetchDonation();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to claim donation.');
    }
  };

  const handleMarkCollected = async () => {
    if (!donation) return;
    try {
      await donationService.markCollected(donation.id, {
        notes: 'Food inspected and collected from donor location.'
      });
      success('Donation marked as collected!');
      fetchDonation();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update collection.');
    }
  };

  const handleComplete = async () => {
    if (!donation) return;
    try {
      await donationService.completeDonation(donation.id);
      success('Donation cycle marked as 100% completed!');
      fetchDonation();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to complete donation.');
    }
  };

  const handleCancel = async () => {
    if (!donation) return;
    try {
      await donationService.cancelDonation(donation.id, cancelReason);
      success('Donation has been cancelled.');
      setIsCancelModalOpen(false);
      fetchDonation();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel donation.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!donation) return null;

  const expired = isDateExpired(donation.expiry_time);
  const isDonorOwner = user && user.id === donation.donor_id;
  const isAssignedHandler = user && (user.id === donation.accepted_by_user_id || user.id === donation.volunteer_id);
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              success('Donation link copied to clipboard!');
            }}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition"
            title="Share donation link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Image & Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={donation.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80'}
              alt={donation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <StatusBadge status={donation.status} size="lg" />
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow-md ${
                donation.dietary_type === 'veg' ? 'bg-emerald-600' : donation.dietary_type === 'vegan' ? 'bg-teal-600' : 'bg-amber-600'
              }`}>
                {donation.dietary_type === 'veg' ? '🌱 Veg' : donation.dietary_type === 'vegan' ? '🌿 Vegan' : '🍖 Non-Veg'}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {formatCategoryName(donation.food_category)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {donation.title}
              </h1>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Food Description & Safety Guidelines</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {donation.description}
            </p>

            {donation.pickup_notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                <span className="font-bold">Pickup Instructions: </span>
                {donation.pickup_notes}
              </div>
            )}

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Preparation Time
                </span>
                <p className="font-bold text-slate-800">{formatDate(donation.preparation_time)}</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  Consume Before / Expiry
                </span>
                <p className={`font-bold ${expired ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatDate(donation.expiry_time)} {expired && '(Expired)'}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution Records if available */}
          {donation.distribution && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Users className="w-5 h-5 text-purple-700" />
                <span>Verified Community Distribution Record</span>
              </div>
              <p className="text-xs text-purple-950 font-medium">
                Location: <span className="font-bold">{donation.distribution.distribution_location}</span>
              </p>
              <p className="text-xs text-purple-950 font-medium">
                Beneficiaries Fed: <span className="font-bold text-purple-800 text-sm">{donation.distribution.beneficiaries_reached} People</span>
              </p>
              {donation.distribution.notes && (
                <p className="text-xs text-purple-800 italic">
                  "{donation.distribution.notes}"
                </p>
              )}
            </div>
          )}

          {/* Reciprocal Reviews */}
          {donation.reviews && donation.reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>Partner Reviews & Feedback</span>
              </h3>
              <div className="space-y-3">
                {donation.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {rev.reviewer_name} ({rev.reviewer_role?.toUpperCase()})
                      </span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>}
                    <span className="text-[10px] text-slate-400">{formatDate(rev.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Donor Card, Partner Card & Action Station */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metrics Quick Box */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
              <span className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider">Quantity</span>
              <p className="text-xl font-extrabold text-brand-700 mt-1">{donation.quantity} {donation.quantity_unit}</p>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">People Fed</span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">~{donation.servings_estimate} Servings</p>
            </div>
          </div>

          {/* Action Station */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Status & Action Control
            </h3>

            {donation.status === 'AVAILABLE' && (
              <>
                {(!user || user.role === 'ngo' || user.role === 'volunteer' || user.role === 'admin') && (
                  <button
                    onClick={handleClaim}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-brand-600/30 transition hover:scale-102 flex items-center justify-center gap-2"
                  >
                    <span>Claim & Accept Donation</span>
                  </button>
                )}
                {isDonorOwner && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    Your donation is live on the community feed. We will alert you the moment an NGO or volunteer claims it!
                  </p>
                )}
              </>
            )}

            {donation.status === 'ACCEPTED' && (isAssignedHandler || isAdmin) && (
              <button
                onClick={() => setIsPickupModalOpen(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Schedule Pickup Window</span>
              </button>
            )}

            {donation.status === 'PICKUP_ASSIGNED' && (isAssignedHandler || isAdmin) && (
              <button
                onClick={handleMarkCollected}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Confirm Food Collected</span>
              </button>
            )}

            {donation.status === 'COLLECTED' && (isAssignedHandler || isAdmin) && (
              <button
                onClick={() => setIsDistributeModalOpen(true)}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Record Community Distribution</span>
              </button>
            )}

            {donation.status === 'DISTRIBUTED' && (isAssignedHandler || isDonorOwner || isAdmin) && (
              <button
                onClick={handleComplete}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Cycle Completed</span>
              </button>
            )}

            {donation.status === 'COMPLETED' && (
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                <span>Leave Partner Feedback & Rating</span>
              </button>
            )}

            {/* Donor / Admin Cancel Option */}
            {(isDonorOwner || isAdmin) && ['AVAILABLE', 'ACCEPTED'].includes(donation.status) && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                Cancel Donation Posting
              </button>
            )}
          </div>

          {/* Donor Information Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Donor Partner Info</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm">{donation.donor_organization || donation.donor_name}</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{donation.pickup_address}, {donation.pickup_city}, {donation.pickup_pincode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{donation.pickup_contact_number}</span>
              </div>
            </div>
          </div>

          {/* Assigned NGO / Volunteer Card */}
          {donation.accepted_by_name && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Assigned Relief Partner</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">
                  {donation.accepted_ngo_org || donation.accepted_by_name}
                </p>
                {donation.volunteer_name && (
                  <p className="text-slate-600">
                    Courier: <span className="font-bold">{donation.volunteer_name}</span> ({donation.volunteer_vehicle?.toUpperCase() || 'BIKE'})
                  </p>
                )}
                {donation.accepted_by_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{donation.accepted_by_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-Stage Visual Timeline */}
      <DonationTimeline
        currentStatus={donation.status}
        events={donation.timeline}
      />

      {/* Modals */}
      {isPickupModalOpen && (
        <PickupScheduleModal
          isOpen={true}
          donationId={donation.id}
          onClose={() => setIsPickupModalOpen(false)}
          onSuccess={() => fetchDonation()}
        />
      )}

      {isDistributeModalOpen && (
        <DistributionModal
          isOpen={true}
          donationId={donation.id}
          defaultServings={donation.servings_estimate}
          onClose={() => setIsDistributeModalOpen(false)}
          onSuccess={() => fetchDonation()}
        />
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={true}
          donationId={donation.id}
          partnerName={donation.accepted_by_name || 'Partner'}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSuccess={() => fetchDonation()}
        />
      )}

      {/* Cancel Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Cancel Donation Posting</h3>
            <p className="text-xs text-slate-500">Please provide a brief reason for cancelling this listing:</p>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Quantity adjusted or food already utilized."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { FoodDonation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatCategoryName, formatTimeAgo, isDateExpired } from '../../utils/formatters';
import { 
  Clock, 
  MapPin, 
  Users, 
  ChevronRight, 
  Building2, 
  Navigation,
  Utensils
} from 'lucide-react';

interface DonationCardProps {
  donation: FoodDonation;
  onAccept?: (donation: FoodDonation) => void;
  showAcceptButton?: boolean;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onAccept,
  showAcceptButton = false
}) => {
  const expired = isDateExpired(donation.expiry_time);

  // Category fallback placeholder image if no photo uploaded
  const placeholderImages: Record<string, string> = {
    cooked_meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    raw_grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    packaged: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=80',
    fruits_veggies: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
    dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
    other: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80'
  };

  const displayImage = donation.image_url || placeholderImages[donation.food_category] || placeholderImages.other;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-0.5">
      {/* Top Media Container */}
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={displayImage}
            alt={donation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
          
          {/* Status Badge in corner */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={donation.status} size="sm" />
          </div>

          {/* Dietary pill */}
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${
              donation.dietary_type === 'veg'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : donation.dietary_type === 'vegan'
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-amber-600 text-white border-amber-500'
            }`}>
              {donation.dietary_type === 'veg' ? '🌱 Veg' : donation.dietary_type === 'vegan' ? '🌿 Vegan' : '🍖 Non-Veg'}
            </span>
          </div>

          {/* Distance Indicator if user coords supplied */}
          {donation.distance_km !== null && donation.distance_km !== undefined && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[11px] font-semibold">
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>{donation.distance_km} km away</span>
            </div>
          )}

          {/* Category overlay */}
          <div className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-sm">
            {formatCategoryName(donation.food_category)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-brand-700 transition">
            {donation.title}
          </h4>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Utensils className="w-3.5 h-3.5 text-brand-600" />
              <span>{donation.quantity} {donation.quantity_unit}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>~{donation.servings_estimate} Servings</span>
            </div>
          </div>

          {/* Location & Time details */}
          <div className="space-y-1.5 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{donation.pickup_city || 'San Francisco'}, {donation.pickup_pincode}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{donation.donor_organization || donation.donor_name || 'Donor'}</span>
              </div>
              <div className={`flex items-center gap-1 shrink-0 font-medium ${expired ? 'text-rose-600' : 'text-slate-500'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{expired ? 'Expired' : `Expires ${formatTimeAgo(donation.expiry_time)}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-0 flex items-center justify-between gap-2">
        <Link
          to={`/donations/${donation.id}`}
          className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        {showAcceptButton && donation.status === 'AVAILABLE' && onAccept && (
          <button
            onClick={() => onAccept(donation)}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition hover:scale-102"
          >
            Claim Donation
          </button>
        )}
      </div>
    </div>
  );
};

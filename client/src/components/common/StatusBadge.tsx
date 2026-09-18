import React from 'react';
import { DonationStatus } from '../../types';
import { 
  Sparkles, 
  HandHeart, 
  Truck, 
  PackageCheck, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';

interface StatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  const config: Record<DonationStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <HandHeart className="w-3.5 h-3.5 text-blue-600" />
    },
    PICKUP_ASSIGNED: {
      label: 'Pickup Assigned',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Truck className="w-3.5 h-3.5 text-indigo-600" />
    },
    COLLECTED: {
      label: 'Collected',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
    },
    DISTRIBUTED: {
      label: 'Distributed',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: <Users className="w-3.5 h-3.5 text-purple-600" />
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: <XCircle className="w-3.5 h-3.5 text-gray-500" />
    },
    EXPIRED: {
      label: 'Expired',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <Clock className="w-3.5 h-3.5 text-rose-500" />
    }
  };

  const item = config[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: null
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
};

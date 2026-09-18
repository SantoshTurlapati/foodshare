import React from 'react';
import { DonationTimelineEvent, DonationStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { 
  Sparkles, 
  HandHeart, 
  Truck, 
  PackageCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MapPin
} from 'lucide-react';

interface DonationTimelineProps {
  currentStatus: DonationStatus;
  events?: DonationTimelineEvent[];
}

export const DonationTimeline: React.FC<DonationTimelineProps> = ({ currentStatus, events = [] }) => {
  const steps: { key: DonationStatus; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'AVAILABLE',
      title: 'Food Donated',
      desc: 'Posted by donor and listed for pickup',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      key: 'ACCEPTED',
      title: 'Claimed by NGO/Volunteer',
      desc: 'Matched with relief partner',
      icon: <HandHeart className="w-4 h-4" />
    },
    {
      key: 'PICKUP_ASSIGNED',
      title: 'Pickup Scheduled',
      desc: 'Transport & route arranged',
      icon: <Truck className="w-4 h-4" />
    },
    {
      key: 'COLLECTED',
      title: 'Food Collected',
      desc: 'Inspected and loaded safely',
      icon: <PackageCheck className="w-4 h-4" />
    },
    {
      key: 'DISTRIBUTED',
      title: 'Community Distributed',
      desc: 'Delivered to beneficiaries',
      icon: <Users className="w-4 h-4" />
    },
    {
      key: 'COMPLETED',
      title: 'Completed',
      desc: 'Zero waste milestone verified',
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ];

  const statusHierarchy: Record<DonationStatus, number> = {
    AVAILABLE: 0,
    ACCEPTED: 1,
    PICKUP_ASSIGNED: 2,
    COLLECTED: 3,
    DISTRIBUTED: 4,
    COMPLETED: 5,
    CANCELLED: -1,
    EXPIRED: -2
  };

  const currentLevel = statusHierarchy[currentStatus] ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Donation Lifecycle Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">End-to-end transparent verification trail</p>
        </div>
        {currentStatus === 'CANCELLED' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            <XCircle className="w-4 h-4 text-gray-500" />
            Cancelled
          </span>
        )}
        {currentStatus === 'EXPIRED' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Clock className="w-4 h-4 text-rose-500" />
            Expired
          </span>
        )}
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-2 relative">
        {steps.map((step, index) => {
          const isDone = currentLevel >= index;
          const isCurrent = currentLevel === index;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                    currentLevel > index ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Circle icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                } ${isCurrent ? 'animate-bounce' : ''}`}
              >
                {step.icon}
              </div>

              <div className="mt-2.5">
                <p className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 max-w-[110px] leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Timeline Log List */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Activity Audit Trail</h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No activity logged yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((ev) => (
              <div key={ev.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 border-2 border-white" />
                
                <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-100 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      {ev.title}
                      {ev.actor_name && (
                        <span className="text-[10px] font-normal text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                          By {ev.actor_name} ({ev.actor_role?.toUpperCase()})
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(ev.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                  {ev.location_note && (
                    <div className="flex items-center gap-1 text-[11px] text-brand-700 font-medium mt-1.5">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>{ev.location_note}</span>
                    </div>
                  )}

                  {ev.proof_image_url && (
                    <div className="mt-2">
                      <img
                        src={ev.proof_image_url}
                        alt="Proof"
                        className="w-24 h-24 rounded-lg object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

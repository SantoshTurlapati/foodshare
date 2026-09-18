import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { Bell, CheckCheck, Check, Sparkles, AlertCircle, Info, Truck } from 'lucide-react';

export const NotificationPage: React.FC = () => {
  const { setUnreadCount } = useAuth();
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Fetch notifs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      success('All notifications marked as read.');
    } catch (err) {
      error('Failed to mark all as read.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            <span>Notifications Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time alerts for donation claims, pickup tasks, and community impact</p>
        </div>

        {notifications.some((n) => n.is_read === 0) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition border border-brand-200"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Notifications</h3>
          <p className="text-xs text-slate-500">You're all caught up! New donation lifecycle updates will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                notif.is_read === 0 ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {notif.is_read === 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(notif.created_at)}
                  </span>
                  {notif.donation_id && (
                    <Link
                      to={`/donations/${notif.donation_id}`}
                      className="text-[11px] font-bold text-brand-700 hover:underline"
                    >
                      View Donation #{notif.donation_id} →
                    </Link>
                  )}
                </div>
              </div>

              {notif.is_read === 0 && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

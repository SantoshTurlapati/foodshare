import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { AdminStats, User, FoodDonation } from '../types';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate, formatCategoryName } from '../utils/formatters';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Bike, 
  Utensils, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  ShieldCheck, 
  Search,
  History,
  FileText
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AdminDashboard: React.FC = () => {
  const { success, error } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'analytics' | 'verification' | 'users' | 'donations' | 'audit'>('analytics');

  // Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [donationSearch, setDonationSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donationsRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getDonations(),
        adminService.getAuditLogs()
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setDonations(donationsRes.donations);
      setAuditLogs(logsRes.logs);
    } catch (err) {
      console.error('Fetch admin data error:', err);
      error('Failed to load admin management portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      success(`User account is now ${nextStatus}.`);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleVerifyNgo = async (ngoUserId: number, status: 'approved' | 'rejected') => {
    try {
      await adminService.updateNgoVerification(ngoUserId, status, `Reviewed and ${status} by system administrator.`);
      success(`NGO verification marked as ${status}.`);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update NGO verification.');
    }
  };

  const handleDeleteDonation = async (donationId: number) => {
    if (!window.confirm('Are you sure you want to remove this donation from the platform?')) return;
    try {
      await adminService.deleteDonation(donationId);
      success('Donation listing deleted.');
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete donation.');
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Chart Data Configurations
  const categoryChartData = {
    labels: stats.charts.categoryBreakdown.map((c) => formatCategoryName(c.food_category)),
    datasets: [
      {
        data: stats.charts.categoryBreakdown.map((c) => c.count),
        backgroundColor: [
          '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const statusChartData = {
    labels: stats.charts.statusBreakdown.map((s) => s.status),
    datasets: [
      {
        label: 'Donation Count',
        data: stats.charts.statusBreakdown.map((s) => s.count),
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  const trendChartData = {
    labels: stats.charts.recentTrend.map((t) => t.date),
    datasets: [
      {
        label: 'Daily Donations Rescued',
        data: stats.charts.recentTrend.map((t) => t.count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = !userSearch || u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const pendingNgos = users.filter((u) => u.role === 'ngo' && (u as any).ngo_verification === 'pending');

  const filteredDonations = donations.filter((d) => {
    return !donationSearch || d.title.toLowerCase().includes(donationSearch.toLowerCase()) || d.pickup_city.toLowerCase().includes(donationSearch.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Administrative Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            System Administration & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Audit platform activity, approve NGO credentials, manage participants, and monitor food rescue analytics.
          </p>
        </div>

        {pendingNgos.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">{pendingNgos.length} NGO Verifications Pending</p>
              <button
                onClick={() => setActiveTab('verification')}
                className="text-amber-300 underline font-semibold mt-0.5"
              >
                Review Credentials Now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Platform Users</span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.users.total}</p>
          <div className="flex gap-2 text-[10px] text-slate-500 pt-1 font-medium">
            <span>🍲 {stats.users.donors} Donors</span>
            <span>🏛️ {stats.users.ngos} NGOs</span>
            <span>🚴 {stats.users.volunteers} Vols</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Donations</span>
          <p className="text-2xl font-extrabold text-indigo-600">{stats.donations.total}</p>
          <p className="text-[11px] text-slate-500 font-medium">{stats.donations.active} Active Pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meals Fed</span>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.donations.totalMeals}</p>
          <p className="text-[11px] text-slate-500 font-medium">100% Zero Hunger Impact</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Landfill Carbon Offset</span>
          <p className="text-2xl font-extrabold text-purple-600">{stats.donations.co2OffsetKg} kg</p>
          <p className="text-[11px] text-slate-500 font-medium">Methane & CO₂ Prevented</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Visual Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 relative ${
            activeTab === 'verification'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>NGO Verification Queue</span>
          {pendingNgos.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingNgos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'donations'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Moderation & Listings ({donations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Charts & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Donations by Food Category</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Donations by Lifecycle Status</h3>
              <div className="h-64 flex items-center justify-center">
                <Bar data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">30-Day Activity Trend</h3>
              <div className="h-64 flex items-center justify-center">
                <Line data={trendChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Recent Platform Operations Feed</h3>
            <div className="divide-y divide-slate-100">
              {stats.recentActivity.map((act: any) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold">
                      {act.event_type}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{act.donation_title}</p>
                      <p className="text-slate-500">{act.description} (By {act.actor_name})</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(act.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NGO Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">NGO Credentials Verification Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Approve or reject NGO legal registration before they can claim public food</p>
          </div>

          {pendingNgos.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>All registered NGO accounts are currently verified and up to date!</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingNgos.map((ngo: any) => (
                <div key={ngo.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{ngo.ngo_name || ngo.full_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pending Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">Contact: {ngo.email} • Phone: {ngo.phone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyNgo(ngo.id, 'approved')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                    >
                      Approve NGO
                    </button>
                    <button
                      onClick={() => handleVerifyNgo(ngo.id, 'rejected')}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Manage Platform Users</h3>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="ngo">NGOs</option>
                <option value="volunteer">Volunteers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{u.full_name}</div>
                      <div className="font-normal text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3 uppercase font-semibold text-slate-700">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(u.created_at)}</td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            u.status === 'active'
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Donations Moderation */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Food Donations Audit & Moderation</h3>
            
            <input
              type="text"
              placeholder="Search donation title or city..."
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-3">ID & Title</th>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Category / Servings</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <Link to={`/donations/${d.id}`} className="font-bold text-slate-800 hover:text-brand-600">
                        #{d.id} {d.title}
                      </Link>
                    </td>
                    <td className="p-3">{d.donor_name}</td>
                    <td className="p-3">
                      <span className="font-semibold">{formatCategoryName(d.food_category)}</span> (~{d.servings_estimate} meals)
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="p-3">{formatDate(d.created_at)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteDonation(d.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete fraudulent or inappropriate listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Trail Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">System Admin Audit Logs</h3>
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                      {log.action_type}
                    </span>
                    <span className="text-slate-800 font-semibold">{log.details}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Admin: {log.admin_name} ({log.admin_email})</p>
                </div>
                <span className="text-[11px] text-slate-400">{formatDate(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

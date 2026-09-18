import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  HeartHandshake, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Building2,
  Utensils,
  Bike
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.full_name}!`);

      if (user.role === 'donor') navigate('/dashboard/donor');
      else if (user.role === 'ngo') navigate('/dashboard/ngo');
      else if (user.role === 'volunteer') navigate('/dashboard/volunteer');
      else if (user.role === 'admin') navigate('/dashboard/admin');
      else navigate('/');
    } catch (err: any) {
      error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <HeartHandshake className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Log in to FoodShare
          </h2>
          <p className="text-xs text-slate-500">
            Access your donation pipeline, task tracker, and impact dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition hover:scale-102 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Click Demo Logins:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => autofill('donor.sarah@freshbites.com', 'Donor@123')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-left font-medium flex items-center gap-2 transition"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>Donor (Sarah)</span>
              </button>

              <button
                type="button"
                onClick={() => autofill('ngo.hope@feedthecity.org', 'Ngo@123')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-left font-medium flex items-center gap-2 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>NGO (FeedTheCity)</span>
              </button>

              <button
                type="button"
                onClick={() => autofill('volunteer.alex@gmail.com', 'Volunteer@123')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-left font-medium flex items-center gap-2 transition"
              >
                <Bike className="w-3.5 h-3.5 text-amber-600" />
                <span>Volunteer (Alex)</span>
              </button>

              <button
                type="button"
                onClick={() => autofill('admin@foodshare.org', 'Admin@123')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-left font-medium flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin (Control)</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800">
                Register for Free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

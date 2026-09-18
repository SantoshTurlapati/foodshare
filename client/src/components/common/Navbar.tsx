import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  PlusCircle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Sparkles,
  LayoutDashboard,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, unreadCount, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemoSwitch = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
      if (email.includes('donor')) navigate('/dashboard/donor');
      else if (email.includes('ngo')) navigate('/dashboard/ngo');
      else if (email.includes('volunteer')) navigate('/dashboard/volunteer');
      else if (email.includes('admin')) navigate('/dashboard/admin');
    } catch (err) {
      console.error('Demo login switch error:', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-brand-900 to-brand-700 bg-clip-text text-transparent">
                FoodShare
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-200">
                Rescue & Feed
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/donations"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/donations') ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Find Food
            </Link>

            {isAuthenticated && user && (
              <>
                {user.role === 'donor' && (
                  <Link
                    to="/dashboard/donor"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/dashboard/donor') ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Donor Dashboard
                  </Link>
                )}

                {user.role === 'ngo' && (
                  <Link
                    to="/dashboard/ngo"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/dashboard/ngo') ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    NGO Dashboard
                  </Link>
                )}

                {user.role === 'volunteer' && (
                  <Link
                    to="/dashboard/volunteer"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/dashboard/volunteer') ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Volunteer Hub
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/dashboard/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/dashboard/admin') ? 'text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    Admin Portal
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Toolbar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                title="Switch between demo accounts for quick testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Demo Switcher
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-slide-in">
                  <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch Active Demo Role:
                  </div>
                  <button
                    onClick={() => handleQuickDemoSwitch('admin@foodshare.org', 'Admin@123')}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center justify-between"
                  >
                    <span className="font-semibold text-purple-700">👑 Admin (Full Access)</span>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickDemoSwitch('donor.sarah@freshbites.com', 'Donor@123')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <span className="font-semibold text-emerald-700">🍲 Donor (Fresh Bites)</span>
                    {user?.role === 'donor' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickDemoSwitch('ngo.hope@feedthecity.org', 'Ngo@123')}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center justify-between"
                  >
                    <span className="font-semibold text-blue-700">🏛️ NGO (FeedTheCity)</span>
                    {user?.role === 'ngo' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickDemoSwitch('volunteer.alex@gmail.com', 'Volunteer@123')}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 text-slate-700 hover:text-amber-900 flex items-center justify-between"
                  >
                    <span className="font-semibold text-amber-700">🚴 Volunteer (Alex)</span>
                    {user?.role === 'volunteer' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <>
                {/* Donate CTA button for donors */}
                {user.role === 'donor' && (
                  <Link
                    to="/dashboard/donor?action=new"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition hover:scale-105"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Donate Food
                  </Link>
                )}

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0)
                    )}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">{user.full_name}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">{user.role}</p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm shadow-brand-600/30 transition hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <Link to="/notifications" className="relative p-2 text-slate-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-slide-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Food Donations
          </Link>

          {isAuthenticated && user ? (
            <>
              {user.role === 'donor' && (
                <Link
                  to="/dashboard/donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-medium text-brand-700 bg-brand-50"
                >
                  Donor Dashboard
                </Link>
              )}
              {user.role === 'ngo' && (
                <Link
                  to="/dashboard/ngo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-medium text-brand-700 bg-brand-50"
                >
                  NGO Dashboard
                </Link>
              )}
              {user.role === 'volunteer' && (
                <Link
                  to="/dashboard/volunteer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-medium text-brand-700 bg-brand-50"
                >
                  Volunteer Hub
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-medium text-purple-700 bg-purple-50"
                >
                  Admin Portal
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile & Settings ({user.full_name})
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Demo Quick Switch */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Switch Demo Account:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemoSwitch('donor.sarah@freshbites.com', 'Donor@123')}
                className="text-xs font-medium p-2 bg-emerald-50 text-emerald-800 rounded-lg text-left"
              >
                🍲 Donor Demo
              </button>
              <button
                onClick={() => handleQuickDemoSwitch('ngo.hope@feedthecity.org', 'Ngo@123')}
                className="text-xs font-medium p-2 bg-blue-50 text-blue-800 rounded-lg text-left"
              >
                🏛️ NGO Demo
              </button>
              <button
                onClick={() => handleQuickDemoSwitch('volunteer.alex@gmail.com', 'Volunteer@123')}
                className="text-xs font-medium p-2 bg-amber-50 text-amber-800 rounded-lg text-left"
              >
                🚴 Volunteer Demo
              </button>
              <button
                onClick={() => handleQuickDemoSwitch('admin@foodshare.org', 'Admin@123')}
                className="text-xs font-medium p-2 bg-purple-50 text-purple-800 rounded-lg text-left"
              >
                👑 Admin Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

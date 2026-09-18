import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">FoodShare</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering communities to reduce food waste and eradicate hunger by connecting surplus food donors directly with verified NGOs and volunteer distributors.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              100% Transparent Lifecycle Tracking
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
              <li><Link to="/donations" className="hover:text-emerald-400 transition">Find Food Donations</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Register as Donor</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Join as NGO</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Volunteer With Us</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Role Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard/donor" className="hover:text-emerald-400 transition">Donor Center</Link></li>
              <li><Link to="/dashboard/ngo" className="hover:text-emerald-400 transition">NGO Operations</Link></li>
              <li><Link to="/dashboard/volunteer" className="hover:text-emerald-400 transition">Volunteer Hub</Link></li>
              <li><Link to="/dashboard/admin" className="hover:text-emerald-400 transition">Admin Dashboard</Link></li>
              <li><Link to="/notifications" className="hover:text-emerald-400 transition">Live Notifications</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support & Helpline</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+1 800 555 FOOD (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>help@foodshare.org</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 FoodShare Inc. All rights reserved. Zero Food Waste Initiative.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Social Impact & Hunger Relief</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

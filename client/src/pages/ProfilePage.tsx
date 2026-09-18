import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building2, 
  Lock, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  Check, 
  Save 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Role profile fields
  const [orgName, setOrgName] = useState(user?.profile?.organization_name || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [city, setCity] = useState(user?.profile?.city || 'San Francisco');
  const [pincode, setPincode] = useState(user?.profile?.pincode || '94103');
  const [vehicleType, setVehicleType] = useState(user?.profile?.vehicle_type || 'bike');

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: any = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim() || null,
        organization_name: orgName.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
        vehicle_type: vehicleType || undefined
      };

      const res = await authService.updateProfile(payload);
      updateUserContext(res.user);
      success('Profile updated successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      error('Please enter current and new password.');
      return;
    }
    try {
      setLoading(true);
      await authService.changePassword(currentPass, newPass);
      success('Password changed successfully!');
      setCurrentPass('');
      setNewPass('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-800 font-extrabold text-2xl flex items-center justify-center overflow-hidden border-4 border-brand-50 shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            fullName.charAt(0)
          )}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{user.full_name}</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
              {user.role}
            </span>
            {user.status === 'active' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active & Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{user.email} • {user.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Settings */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900">Personal & Organization Info</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            {/* Role Specific fields */}
            {(user.role === 'donor' || user.role === 'ngo') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            )}

            {user.role === 'volunteer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="bike">Bicycle / Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van / Cargo</option>
                  <option value="none">Foot / Transit</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 self-start">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Security & Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

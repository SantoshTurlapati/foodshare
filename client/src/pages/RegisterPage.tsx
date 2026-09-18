import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  Bike, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'donor';

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Donor fields
  const [donorType, setDonorType] = useState('restaurant');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [pincode, setPincode] = useState('94103');

  // NGO fields
  const [regNumber, setRegNumber] = useState('');
  const [serviceAreas, setServiceAreas] = useState('Downtown, Mission, SOMA');

  // Volunteer fields
  const [vehicleType, setVehicleType] = useState('bike');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phone) {
      error('Please fill in all mandatory profile fields.');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim(),
        role,
        address: address.trim() || 'Main City Address',
        city: city.trim() || 'San Francisco',
        pincode: pincode.trim() || '94103'
      };

      if (role === 'donor') {
        payload.donor_type = donorType;
        payload.organization_name = orgName.trim() || fullName.trim();
      } else if (role === 'ngo') {
        payload.organization_name = orgName.trim() || fullName.trim();
        payload.registration_number = regNumber.trim() || `REG-${Date.now().toString().slice(-5)}`;
        payload.service_areas = serviceAreas.trim();
      } else if (role === 'volunteer') {
        payload.vehicle_type = vehicleType;
      }

      const user = await register(payload);
      success(`Welcome to FoodShare, ${user.full_name}! Your account is active.`);

      if (role === 'donor') navigate('/dashboard/donor');
      else if (role === 'ngo') navigate('/dashboard/ngo');
      else if (role === 'volunteer') navigate('/dashboard/volunteer');
      else navigate('/');
    } catch (err: any) {
      error(err.response?.data?.message || 'Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <HeartHandshake className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your FoodShare Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the movement to feed hungry families and eliminate food waste
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          {/* Role selector tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                  role === 'donor'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                  role === 'ngo'
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>NGO / Shelter</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                  role === 'volunteer'
                    ? 'bg-white text-amber-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-600" />
                <span>Volunteer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Core credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Contact Person *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 415 555 0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="sarah@freshbites.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Dynamic Section */}
            {role === 'donor' && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <p className="text-xs font-bold text-emerald-800">Donor Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Donor Type</label>
                    <select
                      value={donorType}
                      onChange={(e) => setDonorType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="restaurant">Restaurant / Cafe</option>
                      <option value="caterer">Caterer / Banquet</option>
                      <option value="supermarket">Supermarket / Grocery</option>
                      <option value="corporate">Corporate Office</option>
                      <option value="individual">Individual / Household</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Business / Organization Name</label>
                    <input
                      type="text"
                      placeholder="Fresh Bites Cafe"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'ngo' && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <p className="text-xs font-bold text-blue-800">NGO Verification Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="FeedTheCity Relief Foundation"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Registration / Trust Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="NGO-CA-884920"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'volunteer' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                <p className="text-xs font-bold text-amber-800">Volunteer Vehicle & Logistics</p>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Primary Transport Vehicle</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="bike">Bicycle / Motorcycle</option>
                    <option value="car">Car (Standard Capacity)</option>
                    <option value="van">Van / Cargo Truck (Large Capacity)</option>
                    <option value="none">Walking / Public Transit</option>
                  </select>
                </div>
              </div>
            )}

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Street *</label>
                <input
                  type="text"
                  required
                  placeholder="742 Evergreen Terrace"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition hover:scale-102 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-brand-700 hover:text-brand-800">
                Log In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

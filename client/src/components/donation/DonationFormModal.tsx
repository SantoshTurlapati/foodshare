import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import { FoodDonation, FoodCategory, DietaryType } from '../../types';
import { 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Check, 
  Utensils, 
  Sparkles,
  Info
} from 'lucide-react';

interface DonationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (donation: FoodDonation) => void;
}

export const DonationFormModal: React.FC<DonationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked_meal');
  const [dietary, setDietary] = useState<DietaryType>('veg');
  const [quantity, setQuantity] = useState<string>('20');
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [servings, setServings] = useState<string>('40');
  const [description, setDescription] = useState('');

  // Datetime presets
  const now = new Date();
  const defaultPrep = new Date(now.getTime() - 15 * 60 * 1000).toISOString().slice(0, 16);
  const defaultExp = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [prepTime, setPrepTime] = useState(defaultPrep);
  const [expiryTime, setExpiryTime] = useState(defaultExp);

  // Location
  const [address, setAddress] = useState('742 Evergreen Terrace, Downtown');
  const [city, setCity] = useState('San Francisco');
  const [pincode, setPincode] = useState('94103');
  const [phone, setPhone] = useState('+1 415 555 2671');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);

  // Image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        error('File size cannot exceed 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleQuickExpiry = (hours: number) => {
    const exp = new Date(Date.now() + hours * 60 * 60 * 1000);
    setExpiryTime(exp.toISOString().slice(0, 16));
  };

  const categories: { key: FoodCategory; label: string; icon: string }[] = [
    { key: 'cooked_meal', label: 'Cooked Meals', icon: '🍲' },
    { key: 'raw_grocery', label: 'Raw Groceries', icon: '🌾' },
    { key: 'bakery', label: 'Bakery & Bread', icon: '🥐' },
    { key: 'packaged', label: 'Packaged Food', icon: '📦' },
    { key: 'fruits_veggies', label: 'Fruits & Veggies', icon: '🍎' },
    { key: 'dairy', label: 'Dairy Items', icon: '🥛' },
    { key: 'beverages', label: 'Beverages', icon: '🧃' },
    { key: 'other', label: 'Other Food', icon: '🍱' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quantity || !servings || !description.trim() || !address.trim() || !city.trim() || !phone.trim()) {
      error('Please fill in all mandatory donation fields.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('food_category', category);
      formData.append('dietary_type', dietary);
      formData.append('quantity', quantity);
      formData.append('quantity_unit', quantityUnit);
      formData.append('servings_estimate', servings);
      formData.append('description', description.trim());
      formData.append('preparation_time', new Date(prepTime).toISOString());
      formData.append('expiry_time', new Date(expiryTime).toISOString());
      formData.append('pickup_address', address.trim());
      formData.append('pickup_city', city.trim());
      formData.append('pickup_pincode', pincode.trim());
      formData.append('pickup_contact_number', phone.trim());
      if (notes.trim()) formData.append('pickup_notes', notes.trim());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await donationService.createDonation(formData);
      success('Donation published successfully! Verified NGOs have been alerted.');
      onSuccess(res.donation);
      onClose();
    } catch (err: any) {
      console.error('Create donation form error:', err);
      error(err.response?.data?.message || 'Failed to post donation. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Surplus Food Donation"
      subtitle="Connect good surplus food with verified organizations and shelters"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select Food Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                  category === c.key
                    ? 'border-brand-500 bg-brand-50/80 text-brand-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Dietary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food Item Title / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50 Servings Vegetable Biryani & Raita Trays"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dietary Type *
            </label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value as DietaryType)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="veg">🌱 Vegetarian</option>
              <option value="vegan">🌿 100% Vegan</option>
              <option value="non_veg">🍖 Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Quantity & Servings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Number *
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit *
            </label>
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="meals">Prepared Meals</option>
              <option value="boxes">Boxes / Trays</option>
              <option value="packets">Packets / Pack</option>
              <option value="liters">Liters</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated People Fed *
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 50"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-semibold text-brand-700"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Food Details & Handling Notes *
          </label>
          <textarea
            rows={2}
            required
            placeholder="Describe food contents, packaging method (e.g. foil containers, vacuum sealed), allergens, storage temperature..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Timestamps with quick chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Preparation Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Consume-Before / Expiry Time *
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickExpiry(4)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium"
                >
                  +4h
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExpiry(12)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium"
                >
                  +12h
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExpiry(24)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium"
                >
                  +24h
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-rose-700 font-semibold"
            />
          </div>
        </div>

        {/* Pickup Address & Contact */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Pickup Coordinates & Location Details
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Special Pickup Gate / Instructions (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Ring loading bay intercom, entrance via alleyway."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Upload Food Photo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-brand-50/30 transition">
              <Upload className="w-6 h-6 text-brand-600 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
              <span className="text-[10px] text-slate-400">PNG, JPG or WebP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {previewUrl && (
              <div className="w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Publishing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Post Food Donation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

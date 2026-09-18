import React, { useState, useEffect } from 'react';
import { donationService, DonationFilters } from '../services/donationService';
import { FoodDonation, FoodCategory } from '../types';
import { DonationCard } from '../components/donation/DonationCard';
import { DonationMapView } from '../components/donation/DonationMapView';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  List, 
  Map, 
  Sparkles, 
  Clock, 
  SlidersHorizontal,
  UtensilsCrossed,
  RotateCcw
} from 'lucide-react';

export const BrowseDonationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [dietary, setDietary] = useState<string>('all');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [sort, setSort] = useState<string>('newest');
  const [city, setCity] = useState<string>('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const filters: DonationFilters = {
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        dietary: dietary !== 'all' ? dietary : undefined,
        status: status !== 'all' ? status : undefined,
        city: city || undefined,
        sort
      };

      // Default user coordinates in San Francisco for distance calculation
      filters.userLat = 37.7749;
      filters.userLng = -122.4194;

      const res = await donationService.getDonations(filters);
      setDonations(res.donations);
    } catch (err: any) {
      error('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, dietary, status, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setDietary('all');
    setStatus('AVAILABLE');
    setSort('newest');
    setCity('');
  };

  const handleClaimDonation = async (donation: FoodDonation) => {
    if (!isAuthenticated) {
      error('Please log in as an NGO or Volunteer to claim food donations.');
      return;
    }
    if (user?.role !== 'ngo' && user?.role !== 'volunteer' && user?.role !== 'admin') {
      error('Only registered NGOs and Volunteers can claim donations.');
      return;
    }

    try {
      await donationService.acceptDonation(donation.id);
      success(`Successfully claimed "${donation.title}"! Coordinated pickup details unlocked.`);
      fetchDonations();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to claim donation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Real-Time Redistribution Feed
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Available Surplus Food
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover active food donations ready for rescue, collection, and community dining programs.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Cards Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'map' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4 text-emerald-600" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by food name, description, cuisine or pickup location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 text-slate-400 hover:text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Multi-criteria dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="cooked_meal">Cooked Meals</option>
              <option value="raw_grocery">Raw Groceries</option>
              <option value="bakery">Bakery & Bread</option>
              <option value="packaged">Packaged Foods</option>
              <option value="fruits_veggies">Fruits & Veggies</option>
              <option value="dairy">Dairy</option>
              <option value="beverages">Beverages</option>
            </select>
          </div>

          {/* Dietary */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dietary Preference</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Dietary Types</option>
              <option value="veg">🌱 Vegetarian</option>
              <option value="vegan">🌿 Vegan Only</option>
              <option value="non_veg">🍖 Non-Vegetarian</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="AVAILABLE">Available for Pickup</option>
              <option value="ACCEPTED">Claimed / In Progress</option>
              <option value="COLLECTED">Collected</option>
              <option value="DISTRIBUTED">Distributed</option>
              <option value="COMPLETED">Completed</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="newest">Newest Listed</option>
              <option value="nearest">Nearest Distance (GPS)</option>
              <option value="expiring_soon">Expiring Soonest ⏳</option>
              <option value="quantity_desc">Highest Servings (Large)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading food donations pipeline...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🍲
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Food Donations Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no donations matching your search criteria. Try changing the category or clearing the filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 rounded-xl hover:bg-brand-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <DonationMapView donations={donations} />
          <p className="text-xs text-slate-500 text-center">
            Click on any colored pin on the map to preview food quantities, donor organization, and open full details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              showAcceptButton={user?.role === 'ngo' || user?.role === 'volunteer' || user?.role === 'admin'}
              onAccept={handleClaimDonation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

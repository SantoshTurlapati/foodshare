import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Leaf, 
  Utensils, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  ChevronDown, 
  Star,
  Clock,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Interactive Impact Calculator State
  const [mealsInput, setMealsInput] = useState<number>(150);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const calculatedCo2 = Math.round(mealsInput * 1.8);
  const calculatedPeople = mealsInput;
  const calculatedMealsRescued = mealsInput;

  const faqs = [
    {
      q: 'How does FoodShare ensure the safety and hygiene of donated food?',
      a: 'FoodShare enforces strict preparation and expiry time logging. Donors specify safe storage conditions, packaging details, and dietary info. Upon pickup, volunteers and NGOs perform visual and temperature inspections prior to community distribution.'
    },
    {
      q: 'Who is eligible to register as an NGO or Volunteer?',
      a: 'Registered charitable trusts, food banks, shelters, and community relief programs can register as NGOs. Community members with bikes, cars, or vans can register as volunteer drivers. Admin verification ensures all recipient organizations are authentic.'
    },
    {
      q: 'Is there any cost or fee to use FoodShare?',
      a: 'FoodShare is 100% free and open to all donors, non-profits, and volunteers. Our mission is pure zero-waste social impact.'
    },
    {
      q: 'Can individuals donate small amounts of home-cooked food?',
      a: 'Yes! Whether you are a catering hall with 200 banquet meals or a family with a surplus dinner tray, FoodShare connects you with nearby volunteers and local shelters.'
    },
    {
      q: 'How can donors track where their food was distributed?',
      a: 'Every donation features a 5-stage transparent timeline. When food is distributed, NGOs submit distribution records showing the community shelter location and number of people fed.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-200/40 via-emerald-100/30 to-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Zero Hunger • Zero Waste Initiative</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Share Food.{' '}
                <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
                  Reduce Waste.
                </span>{' '}
                Feed Hope.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connecting surplus food from restaurants, caterers, grocery stores, and households with verified NGOs and volunteer distributors to make sure good food reaches people who need it.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/register?role=donor"
                  className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 hover:scale-105 transition flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Donate Food</span>
                </Link>

                <Link
                  to="/donations"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm hover:scale-105 transition flex items-center gap-2"
                >
                  <span>Find Food</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  to="/register?role=volunteer"
                  className="px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 transition"
                >
                  Join as Volunteer
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified NGO Partners</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Live Expiry Monitoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transparent Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100/80 space-y-6">
                {/* Floating pill 1 */}
                <div className="absolute -top-4 -left-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
                  <Utensils className="w-4 h-4" />
                  <span>550+ Meals Rescued Today</span>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 relative">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80"
                    alt="Volunteers sharing food"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-semibold bg-brand-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      Community Food Rescue
                    </span>
                    <p className="text-sm font-bold mt-1">St. Anthony Dining Hall • 150 Fed</p>
                  </div>
                </div>

                {/* Progress bar simulation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Monthly Goal: 10,000 Meals</span>
                    <span className="text-brand-600">84% Reached</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full w-[84%]" />
                  </div>
                </div>

                {/* Testimonial quote snippet */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed">
                    "FoodShare transformed our restaurant closing routine. Our chef packs surplus trays, and an NGO driver collects it in 30 minutes!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Impact Counter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">12,450+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Meals Rescued</p>
            </div>

            <div className="space-y-1 pt-6 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">22.4 Tons</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">CO₂ Emissions Prevented</p>
            </div>

            <div className="space-y-1 pt-6 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400">45+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Verified NGOs & Shelters</p>
            </div>

            <div className="space-y-1 pt-6 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">180+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Volunteer Couriers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How FoodShare Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A transparent and frictionless food rescue chain ensuring zero edible food ends up in landfills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Donor Posts Food</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restaurant, bakery, or individual logs surplus food name, quantity, expiry time, and pickup address.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">NGO Claims & Matches</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nearby verified NGOs and volunteers receive instant alerts and claim matching food for their dining halls.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-extrabold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Food Collected</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A courier or NGO van collects the food safely in thermal containers and updates live status.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base">Distributed & Verified</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Food is served to families in need. Beneficiary count and transparent distribution record is finalized.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Waste Reduction & Impact Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Interactive Impact Calculator</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              See the Difference Your Surplus Food Makes
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every kilogram of rescued food prevents toxic landfill methane emissions and directly relieves local food insecurity.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Surplus Meals Donated:</span>
                <span className="text-emerald-400 text-base">{mealsInput} Meals</span>
              </div>

              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={mealsInput}
                onChange={(e) => setMealsInput(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>10 Meals</span>
                <span>500 Meals</span>
                <span>1,000 Meals</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-1">
              <p className="text-3xl font-extrabold text-emerald-400">{calculatedPeople}</p>
              <p className="text-xs font-semibold text-slate-300">People Fed With Dignity</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-1">
              <p className="text-3xl font-extrabold text-amber-400">{calculatedCo2} kg</p>
              <p className="text-xs font-semibold text-slate-300">CO₂ Equivalent Offset</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-1">
              <p className="text-3xl font-extrabold text-blue-400">{Math.round(mealsInput * 0.45)} kg</p>
              <p className="text-xs font-semibold text-slate-300">Organic Food Rescued</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-1">
              <p className="text-3xl font-extrabold text-purple-400">100%</p>
              <p className="text-xs font-semibold text-slate-300">Direct Social Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role Benefit Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            A Platform Built for Every Participant
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Whether you are giving, collecting, distributing, or managing, FoodShare empowers your role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* For Donors */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                🍲
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Food Donors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Restaurants, banquets, cafes, grocers, and individual households.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>List food in under 60 seconds with photo & location</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time notifications when an NGO claims your food</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Monthly CSR ESG sustainability reports</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register?role=donor"
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
            >
              Sign Up as Donor →
            </Link>
          </div>

          {/* For NGOs */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                🏛️
              </div>
              <h3 className="text-xl font-bold text-slate-900">For NGOs & Shelters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified charities, orphanages, elder care centers, and food pantries.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Browse map & instant filter by category & distance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>1-click donation claim & pickup dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Log distribution metrics & build donor trust</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register?role=ngo"
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
            >
              Register Your NGO →
            </Link>
          </div>

          {/* For Volunteers */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                🚴
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Volunteers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passionate community members with bicycles, motorbikes, cars, or vans.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pick up food donations along your daily commute</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Earn community impact milestones & badges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Be the frontline hero feeding vulnerable neighbors</span>
                </li>
              </ul>
            </div>

            <Link
              to="/register?role=volunteer"
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
            >
              Join as Volunteer →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600">Everything you need to know about donation safety, verification, and operations.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-sm text-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Call To Action Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 to-emerald-600 rounded-3xl p-10 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Help Eradicate Hunger in Your City?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of active donors, verified NGOs, and volunteers building a sustainable food redistribution ecosystem today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-brand-800 font-bold text-sm rounded-xl shadow-md hover:scale-105 transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/donations"
              className="px-8 py-3.5 bg-brand-800/60 hover:bg-brand-800 text-white font-bold text-sm rounded-xl border border-white/20 transition"
            >
              Explore Available Food
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Donor Profiles
CREATE TABLE IF NOT EXISTS donor_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  donor_type TEXT NOT NULL CHECK (donor_type IN ('individual', 'restaurant', 'caterer', 'supermarket', 'corporate')),
  organization_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  default_contact TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NGO Profiles
CREATE TABLE IF NOT EXISTS ngo_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  fcra_number TEXT,
  established_year INTEGER,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  service_areas TEXT,
  verification_status TEXT NOT NULL DEFAULT 'approved' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  beneficiary_count_estimate INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Volunteer Profiles
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'bike' CHECK (vehicle_type IN ('bike', 'car', 'van', 'none')),
  service_radius_km REAL DEFAULT 15.0,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'inactive')),
  total_deliveries_completed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Food Donations table
CREATE TABLE IF NOT EXISTS food_donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  food_category TEXT NOT NULL CHECK (food_category IN ('cooked_meal', 'raw_grocery', 'bakery', 'packaged', 'fruits_veggies', 'dairy', 'beverages', 'other')),
  dietary_type TEXT NOT NULL DEFAULT 'veg' CHECK (dietary_type IN ('veg', 'non_veg', 'vegan')),
  quantity REAL NOT NULL,
  quantity_unit TEXT NOT NULL,
  servings_estimate INTEGER NOT NULL,
  description TEXT NOT NULL,
  preparation_time DATETIME NOT NULL,
  expiry_time DATETIME NOT NULL,
  image_url TEXT,
  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_pincode TEXT NOT NULL,
  pickup_contact_number TEXT NOT NULL,
  pickup_notes TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  accepted_by_user_id INTEGER,
  volunteer_id INTEGER,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  pickup_assigned_at DATETIME,
  collected_at DATETIME,
  distributed_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (accepted_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Donation Timeline Events
CREATE TABLE IF NOT EXISTS donation_timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  actor_user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_note TEXT,
  proof_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Distribution Records
CREATE TABLE IF NOT EXISTS distribution_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER UNIQUE NOT NULL,
  handler_user_id INTEGER NOT NULL,
  distribution_location TEXT NOT NULL,
  beneficiaries_reached INTEGER NOT NULL,
  notes TEXT,
  distribution_photos TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
  FOREIGN KEY (handler_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  donation_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'donation_status',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE SET NULL
);

-- Feedback / Reviews
CREATE TABLE IF NOT EXISTS feedback_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(donation_id, from_user_id),
  FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id INTEGER,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_donations_status ON food_donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_category ON food_donations(food_category);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON food_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_accepted_by ON food_donations(accepted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

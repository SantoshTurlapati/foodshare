import bcrypt from 'bcryptjs';
import { getDatabase, db } from '../config/database.js';

export async function seedDatabase() {
  console.log('🌱 Starting FoodShare Database Seeder...');
  const database = getDatabase();

  // Clear existing records
  database.exec(`
    DELETE FROM feedback_reviews;
    DELETE FROM distribution_records;
    DELETE FROM donation_timeline_events;
    DELETE FROM notifications;
    DELETE FROM admin_audit_logs;
    DELETE FROM food_donations;
    DELETE FROM volunteer_profiles;
    DELETE FROM ngo_profiles;
    DELETE FROM donor_profiles;
    DELETE FROM users;
  `);

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const donorPass = await bcrypt.hash('Donor@123', salt);
  const ngoPass = await bcrypt.hash('Ngo@123', salt);
  const volunteerPass = await bcrypt.hash('Volunteer@123', salt);

  // 1. Insert Users
  const adminRes = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'admin', 'active', ?)`,
    'admin@foodshare.org',
    adminPass,
    'System Administrator',
    '+1 800 555 0199',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const adminId = Number(adminRes.lastInsertRowid);

  const donor1Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'donor', 'active', ?)`,
    'donor.sarah@freshbites.com',
    donorPass,
    'Sarah Jenkins',
    '+1 415 555 2671',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  );
  const donor1Id = Number(donor1Res.lastInsertRowid);

  db.run(
    `INSERT INTO donor_profiles (user_id, donor_type, organization_name, address, city, pincode, latitude, longitude, default_contact)
     VALUES (?, 'restaurant', 'Fresh Bites Artisanal Cafe', '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', 37.7749, -122.4194, '+1 415 555 2671')`,
    donor1Id
  );

  const donor2Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'donor', 'active', ?)`,
    'donor.raj@spicehaven.com',
    donorPass,
    'Rajesh Kumar',
    '+1 415 555 8821',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );
  const donor2Id = Number(donor2Res.lastInsertRowid);

  db.run(
    `INSERT INTO donor_profiles (user_id, donor_type, organization_name, address, city, pincode, latitude, longitude, default_contact)
     VALUES (?, 'caterer', 'Spice Haven Catering & Banquets', '128 Mission Blvd, Mission District', 'San Francisco', '94110', 37.7599, -122.4148, '+1 415 555 8821')`,
    donor2Id
  );

  const ngo1Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'ngo', 'active', ?)`,
    'ngo.hope@feedthecity.org',
    ngoPass,
    'David Miller (Director)',
    '+1 415 555 9301',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );
  const ngo1Id = Number(ngo1Res.lastInsertRowid);

  db.run(
    `INSERT INTO ngo_profiles (user_id, organization_name, registration_number, fcra_number, established_year, address, city, pincode, service_areas, verification_status, beneficiary_count_estimate)
     VALUES (?, 'FeedTheCity Relief Foundation', 'NGO-CA-884920', 'FCRA-99128', 2016, '500 Howard St, Suite 400', 'San Francisco', '94105', 'Downtown, Mission, SOMA, Tenderloin', 'approved', 850)`,
    ngo1Id
  );

  const ngo2Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'ngo', 'active', ?)`,
    'ngo.care@mealsonwheels.org',
    ngoPass,
    'Elena Rostova (Operations Lead)',
    '+1 415 555 4412',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  );
  const ngo2Id = Number(ngo2Res.lastInsertRowid);

  db.run(
    `INSERT INTO ngo_profiles (user_id, organization_name, registration_number, fcra_number, established_year, address, city, pincode, service_areas, verification_status, beneficiary_count_estimate)
     VALUES (?, 'Meals On Wheels Community Aid', 'NGO-CA-339102', 'FCRA-55410', 2019, '320 Folsom St', 'San Francisco', '94105', 'Bayview, Richmond, Sunset', 'approved', 420)`,
    ngo2Id
  );

  const ngo3Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'ngo', 'active', ?)`,
    'ngo.new@hopeforhunger.org',
    ngoPass,
    'Carlos Santana (Founder)',
    '+1 415 555 6019',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  );
  const ngo3Id = Number(ngo3Res.lastInsertRowid);

  db.run(
    `INSERT INTO ngo_profiles (user_id, organization_name, registration_number, fcra_number, established_year, address, city, pincode, service_areas, verification_status, verification_notes, beneficiary_count_estimate)
     VALUES (?, 'Hope For Hunger Community Trust', 'NGO-CA-771829', null, 2024, '1040 Geary Blvd', 'San Francisco', '94109', 'Tenderloin, Western Addition', 'pending', 'Submitted 501(c)(3) registration documentation. Pending admin review.', 300)`,
    ngo3Id
  );

  const vol1Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'volunteer', 'active', ?)`,
    'volunteer.alex@gmail.com',
    volunteerPass,
    'Alex Rivera',
    '+1 415 555 7734',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  );
  const vol1Id = Number(vol1Res.lastInsertRowid);

  db.run(
    `INSERT INTO volunteer_profiles (user_id, vehicle_type, service_radius_km, city, pincode, availability_status, total_deliveries_completed)
     VALUES (?, 'bike', 10.0, 'San Francisco', '94103', 'available', 14)`,
    vol1Id
  );

  const vol2Res = db.run(
    `INSERT INTO users (email, password_hash, full_name, phone, role, status, avatar_url)
     VALUES (?, ?, ?, ?, 'volunteer', 'active', ?)`,
    'volunteer.maya@gmail.com',
    volunteerPass,
    'Maya Sharma',
    '+1 415 555 1290',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  );
  const vol2Id = Number(vol2Res.lastInsertRowid);

  db.run(
    `INSERT INTO volunteer_profiles (user_id, vehicle_type, service_radius_km, city, pincode, availability_status, total_deliveries_completed)
     VALUES (?, 'van', 25.0, 'San Francisco', '94110', 'available', 28)`,
    vol2Id
  );

  console.log('✅ Users and Profiles created.');

  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  // Donation 1: AVAILABLE
  const d1 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, created_at
    ) VALUES (
      ?, 'Fresh Mediterranean Penne Pasta & Garden Salad Trays', 'cooked_meal', 'veg', 25, 'kg',
      55, 'Surplus freshly cooked penne in marinara with roasted veggies and large bowls of garden salad with dressing on the side. Packed in food-grade aluminum catering trays.',
      ?, ?, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
      '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', '+1 415 555 2671', 'Pickup from kitchen back door on Elm alley.',
      37.7749, -122.4194, 'AVAILABLE', ?
    )
  `, donor1Id, hoursAgo(2), hoursFromNow(6), hoursAgo(2));
  const d1Id = Number(d1.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note, created_at)
          VALUES (?, 'POSTED', ?, 'Donation Posted', '55 servings of pasta trays listed for immediate collection.', 'San Francisco, 94103', ?)`,
          d1Id, donor1Id, hoursAgo(2));

  // Donation 2: AVAILABLE
  const d2 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, created_at
    ) VALUES (
      ?, 'Artisan Sourdough Loaves & Butter Croissants (Day-End Surplus)', 'bakery', 'veg', 40, 'boxes',
      80, 'Freshly baked today morning. Includes whole grain sourdough loaves, baguettes, and assorted sweet and savory croissants.',
      ?, ?, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', '+1 415 555 2671', 'Ask for pastry counter manager.',
      37.7780, -122.4150, 'AVAILABLE', ?
    )
  `, donor1Id, hoursAgo(4), hoursFromNow(18), hoursAgo(4));
  const d2Id = Number(d2.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Bakery Surplus Posted', '40 boxes of fresh artisan bread and croissants listed.', ?)`,
          d2Id, donor1Id, hoursAgo(4));

  // Donation 3: ACCEPTED
  const d3 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, accepted_by_user_id, accepted_at, created_at
    ) VALUES (
      ?, 'Basmati Jeera Rice & Dal Makhani Catering Pots', 'cooked_meal', 'vegan', 35, 'kg',
      70, 'High quality banquet surplus cooked today afternoon for a corporate luncheon. Packed hot in insulated thermal containers.',
      ?, ?, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      '128 Mission Blvd, Mission District', 'San Francisco', '94110', '+1 415 555 8821', 'Loading bay at the rear entrance.',
      37.7599, -122.4148, 'ACCEPTED', ?, ?, ?
    )
  `, donor2Id, hoursAgo(3), hoursFromNow(5), ngo1Id, hoursAgo(1), hoursAgo(3));
  const d3Id = Number(d3.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Donation Listed', 'Catering surplus posted.', ?)`, d3Id, donor2Id, hoursAgo(3));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'ACCEPTED', ?, 'Accepted by FeedTheCity NGO', 'FeedTheCity Relief Foundation claimed this food for shelter dinner.', ?)`, d3Id, ngo1Id, hoursAgo(1));

  // Donation 4: PICKUP_ASSIGNED
  const d4 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, accepted_by_user_id, volunteer_id, accepted_at, pickup_assigned_at, created_at
    ) VALUES (
      ?, 'Gourmet Boxed Lunches (Veggie & Turkey Wraps with Apples)', 'cooked_meal', 'non_veg', 45, 'meals',
      45, 'Individually wrapped lunch packs with fresh fruits and bottled water from conference meeting.',
      ?, ?, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', '+1 415 555 2671', 'Ready at main reception desk.',
      37.7760, -122.4200, 'PICKUP_ASSIGNED', ?, ?, ?, ?, ?
    )
  `, donor1Id, hoursAgo(4), hoursFromNow(8), ngo1Id, vol1Id, hoursAgo(3), hoursAgo(2), hoursAgo(4));
  const d4Id = Number(d4.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Donation Posted', '45 boxed meals listed.', ?)`, d4Id, donor1Id, hoursAgo(4));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'ACCEPTED', ?, 'Accepted by FeedTheCity', 'Claimed for distribution.', ?)`, d4Id, ngo1Id, hoursAgo(3));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'PICKUP_ASSIGNED', ?, 'Assigned to Alex Rivera', 'Volunteer Alex is on bike courier route for pickup.', ?)`, d4Id, ngo1Id, hoursAgo(2));

  // Donation 5: COLLECTED
  const d5 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, accepted_by_user_id, volunteer_id, accepted_at, pickup_assigned_at, collected_at, created_at
    ) VALUES (
      ?, 'Organic Farm Crisp Apples, Oranges & Green Vegetables Crates', 'fruits_veggies', 'vegan', 120, 'kg',
      240, 'Surplus seasonal fruits and leafy greens. High nutritional value, perfectly sound and edible.',
      ?, ?, 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
      '128 Mission Blvd, Mission District', 'San Francisco', '94110', '+1 415 555 8821', 'Heavy load; van required.',
      37.7605, -122.4130, 'COLLECTED', ?, ?, ?, ?, ?, ?
    )
  `, donor2Id, hoursAgo(6), hoursFromNow(48), ngo2Id, vol2Id, hoursAgo(5), hoursAgo(4), hoursAgo(2), hoursAgo(6));
  const d5Id = Number(d5.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Donation Posted', 'Produce crates listed.', ?)`, d5Id, donor2Id, hoursAgo(6));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'ACCEPTED', ?, 'Accepted by Meals On Wheels', 'Accepted for food bank pantry.', ?)`, d5Id, ngo2Id, hoursAgo(5));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'PICKUP_ASSIGNED', ?, 'Assigned to Maya Sharma', 'Van pickup dispatched.', ?)`, d5Id, ngo2Id, hoursAgo(4));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note, created_at)
          VALUES (?, 'COLLECTED', ?, 'Food Collected from Donor', 'Loaded into distribution van safely.', 'Mission District', ?)`, d5Id, vol2Id, hoursAgo(2));

  // Donation 6: DISTRIBUTED
  const d6 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, accepted_by_user_id, volunteer_id, accepted_at, pickup_assigned_at, collected_at, distributed_at, created_at
    ) VALUES (
      ?, 'Hearty Roasted Butternut Squash Soup & Garlic Toast', 'cooked_meal', 'veg', 30, 'liters',
      60, 'Large hot containers of vitamin-rich butternut squash soup with rolls of garlic toast.',
      ?, ?, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
      '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', '+1 415 555 2671', 'Pickup near rear kitchen.',
      37.7750, -122.4180, 'DISTRIBUTED', ?, ?, ?, ?, ?, ?, ?
    )
  `, donor1Id, hoursAgo(8), hoursFromNow(4), ngo1Id, vol1Id, hoursAgo(7), hoursAgo(6), hoursAgo(4), hoursAgo(1), hoursAgo(8));
  const d6Id = Number(d6.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Donation Posted', 'Hot soup listed.', ?)`, d6Id, donor1Id, hoursAgo(8));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'ACCEPTED', ?, 'Accepted by FeedTheCity', 'Food claimed for shelter.', ?)`, d6Id, ngo1Id, hoursAgo(7));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'COLLECTED', ?, 'Collected from Donor', 'Hot insulated pots collected.', ?)`, d6Id, vol1Id, hoursAgo(4));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note, created_at)
          VALUES (?, 'DISTRIBUTED', ?, 'Distributed at St. Anthony Shelter', 'Served hot to 60 shelter residents.', 'Golden Gate Ave Community Hall', ?)`, d6Id, ngo1Id, hoursAgo(1));

  db.run(`
    INSERT INTO distribution_records (donation_id, handler_user_id, distribution_location, beneficiaries_reached, notes, completed_at)
    VALUES (?, ?, 'St. Anthony Community Dining Hall, Golden Gate Ave', 60, 'Served all 60 residents with warm soup and bread. Everyone was deeply thankful.', ?)
  `, d6Id, ngo1Id, hoursAgo(1));

  // Donation 7: COMPLETED
  const d7 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number, pickup_notes,
      latitude, longitude, status, accepted_by_user_id, volunteer_id, accepted_at, pickup_assigned_at, collected_at, distributed_at, completed_at, created_at
    ) VALUES (
      ?, 'Grand Banquet Rice, Vegetable Korma & Naan Bread Feasts', 'cooked_meal', 'veg', 80, 'kg',
      150, 'Large wedding banquet surplus. Impeccable hygiene and quality, packed into 15 large catering containers.',
      ?, ?, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
      '128 Mission Blvd, Mission District', 'San Francisco', '94110', '+1 415 555 8821', 'Loading bay ready.',
      37.7599, -122.4148, 'COMPLETED', ?, ?, ?, ?, ?, ?, ?, ?
    )
  `, donor2Id, hoursAgo(24), hoursAgo(12), ngo1Id, vol2Id, hoursAgo(22), hoursAgo(21), hoursAgo(19), hoursAgo(16), hoursAgo(14), hoursAgo(24));
  const d7Id = Number(d7.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'POSTED', ?, 'Banquet Feast Listed', '150 banquet meals donated.', ?)`, d7Id, donor2Id, hoursAgo(24));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'ACCEPTED', ?, 'Accepted by FeedTheCity NGO', 'Assigned for high-density community outreach.', ?)`, d7Id, ngo1Id, hoursAgo(22));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'COLLECTED', ?, 'Collected by Maya (Van)', 'All 15 containers secured.', ?)`, d7Id, vol2Id, hoursAgo(19));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, location_note, created_at)
          VALUES (?, 'DISTRIBUTED', ?, 'Distributed at SOMA Community Center', '150 hot meals served to elderly and unhoused residents.', '6th & Mission Community Park', ?)`, d7Id, ngo1Id, hoursAgo(16));
  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'COMPLETED', ?, 'Donation Cycle Completed', '150 meals rescued! Zero food waste achieved.', ?)`, d7Id, adminId, hoursAgo(14));

  db.run(`
    INSERT INTO distribution_records (donation_id, handler_user_id, distribution_location, beneficiaries_reached, notes, completed_at)
    VALUES (?, ?, 'SOMA Community Outreach Center & Park', 150, 'Full distribution completed in 90 minutes. High quality nutritious meal enjoyed by 150 individuals.', ?)
  `, d7Id, ngo1Id, hoursAgo(16));

  db.run(`
    INSERT INTO feedback_reviews (donation_id, from_user_id, to_user_id, rating, comment, created_at)
    VALUES (?, ?, ?, 5, 'FeedTheCity team was punctual, respectful, and brought proper thermal boxes. A joy to collaborate with!', ?)
  `, d7Id, donor2Id, ngo1Id, hoursAgo(13));

  db.run(`
    INSERT INTO feedback_reviews (donation_id, from_user_id, to_user_id, rating, comment, created_at)
    VALUES (?, ?, ?, 5, 'Exceptional food quality from Spice Haven. The beneficiaries were overjoyed with the fresh hot meal. Outstanding donor partner!', ?)
  `, d7Id, ngo1Id, donor2Id, hoursAgo(12));

  // Donation 8: EXPIRED
  const d8 = db.run(`
    INSERT INTO food_donations (
      donor_id, title, food_category, dietary_type, quantity, quantity_unit,
      servings_estimate, description, preparation_time, expiry_time, image_url,
      pickup_address, pickup_city, pickup_pincode, pickup_contact_number,
      latitude, longitude, status, created_at
    ) VALUES (
      ?, 'Pasteurized Whole Milk & Yogurt Cups (Uncollected)', 'dairy', 'veg', 15, 'liters',
      30, 'Cold storage dairy surplus. Passed shelf-life date without pickup claim.',
      ?, ?, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      '742 Evergreen Terrace, Downtown', 'San Francisco', '94103', '+1 415 555 2671',
      37.7749, -122.4194, 'EXPIRED', ?
    )
  `, donor1Id, hoursAgo(48), hoursAgo(6), hoursAgo(48));
  const d8Id = Number(d8.lastInsertRowid);

  db.run(`INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description, created_at)
          VALUES (?, 'EXPIRED', ?, 'Donation Expired', 'Food reached designated expiry cutoff before pickup was scheduled.', ?)`, d8Id, donor1Id, hoursAgo(6));

  // Initial Notifications
  db.run(`INSERT INTO notifications (user_id, donation_id, title, message, type) VALUES (?, ?, ?, ?, 'donation_status')`,
    donor1Id, d1Id, 'Donation Listed Successfully 🍲', 'Your donation "Fresh Mediterranean Penne Pasta & Garden Salad Trays" is live.');
  db.run(`INSERT INTO notifications (user_id, donation_id, title, message, type) VALUES (?, ?, ?, ?, 'donation_status')`,
    donor2Id, d3Id, 'Donation Accepted! 🎉', 'FeedTheCity Relief Foundation accepted your Basmati Rice & Dal donation.');
  db.run(`INSERT INTO notifications (user_id, donation_id, title, message, type) VALUES (?, ?, ?, ?, 'assignment')`,
    vol1Id, d4Id, 'Pickup Task Assigned 📍', 'You are assigned to collect 45 Boxed Lunches from Fresh Bites Cafe.');
  db.run(`INSERT INTO notifications (user_id, donation_id, title, message, type) VALUES (?, ?, ?, ?, 'donation_status')`,
    ngo1Id, d3Id, 'Donation Claim Confirmed 🤝', 'You claimed donation #3 from Spice Haven Catering.');

  // Initial Audit Logs
  db.run(`
    INSERT INTO admin_audit_logs (admin_user_id, action_type, target_entity, target_id, details)
    VALUES (?, 'SYSTEM_INIT', 'system', null, 'System database initialized and seeded with demo data.')
  `, adminId);

  db.run(`
    INSERT INTO admin_audit_logs (admin_user_id, action_type, target_entity, target_id, details)
    VALUES (?, 'VERIFY_NGO', 'ngo_profiles', ?, 'Approved FeedTheCity Relief Foundation verification credentials.')
  `, adminId, ngo1Id);

  console.log('✨ Database seeding finished successfully!');
}

// Only auto-run if directly executed via CLI
if (process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

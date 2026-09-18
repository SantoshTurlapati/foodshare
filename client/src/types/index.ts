export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending_verification';
export type NgoVerificationStatus = 'pending' | 'approved' | 'rejected';

export type DonationStatus =
  | 'AVAILABLE'
  | 'ACCEPTED'
  | 'PICKUP_ASSIGNED'
  | 'COLLECTED'
  | 'DISTRIBUTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type FoodCategory =
  | 'cooked_meal'
  | 'raw_grocery'
  | 'bakery'
  | 'packaged'
  | 'fruits_veggies'
  | 'dairy'
  | 'beverages'
  | 'other';

export type DietaryType = 'veg' | 'non_veg' | 'vegan';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
  profile?: any;
  unreadNotificationsCount?: number;
}

export interface FoodDonation {
  id: number;
  donor_id: number;
  title: string;
  food_category: FoodCategory;
  dietary_type: DietaryType;
  quantity: number;
  quantity_unit: string;
  servings_estimate: number;
  description: string;
  preparation_time: string;
  expiry_time: string;
  image_url?: string | null;
  pickup_address: string;
  pickup_city: string;
  pickup_pincode: string;
  pickup_contact_number: string;
  pickup_notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: DonationStatus;
  accepted_by_user_id?: number | null;
  volunteer_id?: number | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  pickup_assigned_at?: string | null;
  collected_at?: string | null;
  distributed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  
  // Joins
  donor_name?: string;
  donor_phone?: string;
  donor_email?: string;
  donor_organization?: string | null;
  donor_type?: string;
  accepted_by_name?: string | null;
  accepted_by_phone?: string | null;
  accepted_ngo_org?: string | null;
  volunteer_name?: string | null;
  volunteer_phone?: string | null;
  volunteer_vehicle?: string | null;
  distance_km?: number | null;
  
  timeline?: DonationTimelineEvent[];
  distribution?: DistributionRecord;
  reviews?: FeedbackReview[];
}

export interface DonationTimelineEvent {
  id: number;
  donation_id: number;
  event_type: string;
  actor_user_id: number;
  actor_name?: string;
  actor_role?: string;
  title: string;
  description: string;
  location_note?: string | null;
  proof_image_url?: string | null;
  created_at: string;
}

export interface DistributionRecord {
  id: number;
  donation_id: number;
  handler_user_id: number;
  distribution_location: string;
  beneficiaries_reached: number;
  notes?: string | null;
  distribution_photos?: string | null;
  completed_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  donation_id?: number | null;
  title: string;
  message: string;
  type: 'donation_status' | 'verification' | 'system' | 'assignment';
  is_read: number;
  created_at: string;
}

export interface FeedbackReview {
  id: number;
  donation_id: number;
  from_user_id: number;
  to_user_id: number;
  reviewer_name?: string;
  reviewer_role?: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface AdminStats {
  users: {
    total: number;
    donors: number;
    ngos: number;
    volunteers: number;
    pendingNgos: number;
  };
  donations: {
    total: number;
    active: number;
    available: number;
    completed: number;
    expired: number;
    cancelled: number;
    totalMeals: number;
    co2OffsetKg: number;
  };
  charts: {
    categoryBreakdown: { food_category: string; count: number; total_servings: number }[];
    statusBreakdown: { status: string; count: number }[];
    recentTrend: { date: string; count: number }[];
  };
  recentActivity: any[];
}

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
  password_hash: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonorProfile {
  id: number;
  user_id: number;
  donor_type: 'individual' | 'restaurant' | 'caterer' | 'supermarket' | 'corporate';
  organization_name?: string | null;
  address: string;
  city: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  default_contact?: string | null;
}

export interface NgoProfile {
  id: number;
  user_id: number;
  organization_name: string;
  registration_number: string;
  fcra_number?: string | null;
  established_year?: number | null;
  address: string;
  city: string;
  pincode: string;
  service_areas?: string | null;
  verification_status: NgoVerificationStatus;
  verification_notes?: string | null;
  beneficiary_count_estimate?: number | null;
}

export interface VolunteerProfile {
  id: number;
  user_id: number;
  vehicle_type: 'bike' | 'car' | 'van' | 'none';
  service_radius_km: number;
  city: string;
  pincode: string;
  availability_status: 'available' | 'busy' | 'inactive';
  total_deliveries_completed: number;
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
}

export interface DonationTimelineEvent {
  id: number;
  donation_id: number;
  event_type: string;
  actor_user_id: number;
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
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface AdminAuditLog {
  id: number;
  admin_user_id: number;
  action_type: string;
  target_entity: string;
  target_id?: number | null;
  details?: string | null;
  created_at: string;
}

export interface AuthUserContext {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  ngo_verification_status?: NgoVerificationStatus;
}

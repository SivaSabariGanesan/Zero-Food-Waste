// API URL - Change this to your actual backend URL in production
export const API_URL = 'http://localhost:5000';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  RESTAURANT: 'restaurant',
  NGO: 'ngo',
  ORPHANAGE: 'orphanage'
};

// Food Categories
export const FOOD_CATEGORIES = [
  'Cooked Meals',
  'Fresh Produce',
  'Bakery Items',
  'Canned Goods',
  'Dairy Products',
  'Beverages',
  'Snacks',
  'Other'
];

// Food Status
export const FOOD_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};
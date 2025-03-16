import express from 'express';
import { 
  createFoodListing, 
  getFoodListings, 
  getFoodById, 
  updateFoodListing, 
  deleteFoodListing, 
  bookFood,
  claimFood, 
  completeFoodPickup, 
  cancelClaim,
  cancelBooking,
  cancelFoodListing, 
  getFoodStats,
  getDeliveryStats,
  getBookingStats,
  getDonationStats
} from '../controllers/foodController.js';
import { protect, verified, restaurant, ngoOrOrphanage, ngo, orphanage, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get all food listings
router.get('/', protect, verified, getFoodListings);

// Get food stats (admin only)
router.get('/stats', protect, admin, getFoodStats);

// Get delivery stats (NGO only)
router.get('/delivery-stats', protect, verified, ngo, getDeliveryStats);

// Get booking stats (orphanage only)
router.get('/booking-stats', protect, verified, orphanage, getBookingStats);

// Get donation stats (restaurant only)
router.get('/donation-stats', protect, verified, restaurant, getDonationStats);

// Create food listing (restaurants only)
router.post('/', protect, verified, restaurant, upload.array('images', 5), createFoodListing);

// Get, update, delete food listing by ID
router.get('/:id', protect, verified, getFoodById);
router.put('/:id', protect, verified, restaurant, upload.array('images', 5), updateFoodListing);
router.delete('/:id', protect, verified, deleteFoodListing);

// Book food (orphanages only)
router.put('/:id/book', protect, verified, orphanage, bookFood);

// Claim food (NGOs only)
router.put('/:id/claim', protect, verified, ngo, claimFood);

// Complete food pickup
router.put('/:id/complete', protect, verified, completeFoodPickup);

// Cancel claim (NGOs only)
router.put('/:id/cancel-claim', protect, verified, ngo, cancelClaim);

// Cancel booking (orphanages only)
router.put('/:id/cancel-booking', protect, verified, orphanage, cancelBooking);

// Cancel food listing (restaurants only)
router.put('/:id/cancel', protect, verified, restaurant, cancelFoodListing);

export default router;
import express from 'express';
import { 
  getDashboardStats, 
  getPendingVerifications, 
  getSystemReports 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', protect, admin, getDashboardStats);

// Pending verifications
router.get('/verifications', protect, admin, getPendingVerifications);

// System reports
router.get('/reports', protect, admin, getSystemReports);

export default router;
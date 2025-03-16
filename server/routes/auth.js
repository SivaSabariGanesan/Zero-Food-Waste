import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', upload.fields([{ name: 'documents', maxCount: 5 }]), registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
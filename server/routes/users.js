import express from 'express';
import { 
  getUsers, 
  getUserById, 
  verifyUser, 
  getUserStats, 
  getUserProfile, 
  deleteUser 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/', protect, admin, getUsers);
router.get('/stats', protect, admin, getUserStats);
router.get('/:id', protect, getUserById);
router.put('/:id/verify', protect, admin, verifyUser);
router.delete('/:id', protect, admin, deleteUser);

// Public profile route
router.get('/profile/:id', protect, getUserProfile);

export default router;
import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user notifications
router.get('/', protect, getUserNotifications);

// Mark notification as read
router.put('/:id/read', protect, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

export default router;
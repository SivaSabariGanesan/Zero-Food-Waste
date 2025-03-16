import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res, next) => {
  try {
    const { 
      read,
      page = 1,
      limit = 10
    } = req.query;

    const query = { recipient: req.user.id };

    // Filter by read status
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const notifications = await Notification.find(query)
      .populate('relatedUser', 'name profileImage')
      .populate('relatedFood', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification removed' });
  } catch (error) {
    next(error);
  }
};
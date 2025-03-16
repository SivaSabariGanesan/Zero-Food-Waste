import User from '../models/User.js';
import Food from '../models/Food.js';
import Notification from '../models/Notification.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access user list' });
    }

    const { 
      role, 
      verificationStatus, 
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by verification status
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res, next) => {
  try {
    // Check if user is admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to access this user' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a user
// @route   PUT /api/users/:id/verify
// @access  Private (Admin only)
export const verifyUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can verify users' });
    }

    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update verification status
    user.verificationStatus = status;
    user.isVerified = status === 'approved';
    if (notes) {
      user.verificationNotes = notes;
    }

    await user.save();

    // Create notification for the user
    await Notification.create({
      recipient: user._id,
      type: status === 'approved' ? 'account_verified' : 'account_rejected',
      title: status === 'approved' ? 'Account Verified' : 'Account Verification Failed',
      message: status === 'approved' 
        ? 'Your account has been verified. You can now use all features of the platform.' 
        : `Your account verification was rejected. Reason: ${notes || 'No reason provided'}`,
      relatedUser: req.user.id
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationNotes: user.verificationNotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
export const getUserStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access statistics' });
    }

    // Get counts by role
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get counts by verification status
    const verificationCounts = await User.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
    ]);

    // Get counts by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top food donors
    const topDonors = await Food.aggregate([
      { $group: { _id: '$donor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $project: {
          _id: '$donor._id',
          name: '$donor.name',
          email: '$donor.email',
          role: '$donor.role',
          count: 1
        }
      }
    ]);

    // Get top food claimers
    const topClaimers = await Food.aggregate([
      { $match: { status: { $in: ['claimed', 'completed'] } } },
      { $group: { _id: '$claimedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'claimer'
        }
      },
      { $unwind: '$claimer' },
      {
        $project: {
          _id: '$claimer._id',
          name: '$claimer.name',
          email: '$claimer.email',
          role: '$claimer.role',
          count: 1
        }
      }
    ]);

    res.json({
      roleCounts: roleCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      verificationCounts: verificationCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      monthlyStats,
      topDonors,
      topClaimers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -documents -verificationNotes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get food listings for this user
    let foodListings = [];
    
    if (user.role === 'restaurant') {
      // For restaurants, get their donations
      foodListings = await Food.find({ donor: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (['ngo', 'orphanage'].includes(user.role)) {
      // For NGOs and orphanages, get their claimed food
      foodListings = await Food.find({ 
        claimedBy: user._id,
        status: { $in: ['claimed', 'completed'] }
      })
        .populate('donor', 'name')
        .sort({ claimedAt: -1 })
        .limit(5);
    }

    res.json({
      user,
      foodListings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to delete an admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Delete user's food listings
    await Food.deleteMany({ donor: user._id });

    // Delete user's notifications
    await Notification.deleteMany({ recipient: user._id });

    // Delete the user
    await user.deleteOne();

    res.json({ message: 'User removed' });
  } catch (error) {
    next(error);
  }
};
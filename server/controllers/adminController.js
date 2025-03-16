import User from '../models/User.js';
import Food from '../models/Food.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access dashboard statistics' });
    }

    // Get user counts
    const totalUsers = await User.countDocuments();
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    
    // Get user counts by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get food counts
    const totalFood = await Food.countDocuments();
    const availableFood = await Food.countDocuments({ status: 'available' });
    const claimedFood = await Food.countDocuments({ status: 'claimed' });
    const completedFood = await Food.countDocuments({ status: 'completed' });
    
    // Get food counts by category
    const foodByCategory = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get recent activity (last 10 food listings)
    const recentActivity = await Food.find()
      .populate('donor', 'name role')
      .populate('claimedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent users (last 5 registrations)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalUsers,
        pendingVerifications,
        byRole: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      food: {
        total: totalFood,
        available: availableFood,
        claimed: claimedFood,
        completed: completedFood,
        byCategory: foodByCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      recentActivity,
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private (Admin only)
export const getPendingVerifications = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access verification requests' });
    }

    const { 
      status = 'pending',
      role,
      page = 1,
      limit = 10
    } = req.query;

    const query = { verificationStatus: status };

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: 1 }) // Oldest first
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

// @desc    Get system reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
export const getSystemReports = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access system reports' });
    }

    const { reportType } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'user-growth':
        // Monthly user growth over the past year
        const userGrowth = await getUserGrowthReport();
        reportData = { userGrowth };
        break;
      
      case 'food-distribution':
        // Food distribution by category and status
        const foodDistribution = await getFoodDistributionReport();
        reportData = { foodDistribution };
        break;
      
      case 'activity-summary':
        // Activity summary (donations, claims, completions)
        const activitySummary = await getActivitySummaryReport();
        reportData = { activitySummary };
        break;
      
      case 'user-engagement':
        // User engagement metrics
        const userEngagement = await getUserEngagementReport();
        reportData = { userEngagement };
        break;
      
      default:
        // Return all reports if no specific type requested
        reportData = {
          userGrowth: await getUserGrowthReport(),
          foodDistribution: await getFoodDistributionReport(),
          activitySummary: await getActivitySummaryReport(),
          userEngagement: await getUserEngagementReport()
        };
    }

    res.json(reportData);
  } catch (error) {
    next(error);
  }
};

// Helper function for user growth report
const getUserGrowthReport = async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const monthlyGrowth = await User.aggregate([
    { 
      $match: { 
        createdAt: { $gte: oneYearAgo } 
      } 
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        count: { $sum: 1 },
        byRole: {
          $push: {
            role: '$role'
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Process to get counts by role for each month
  return monthlyGrowth.map(month => {
    const roleCount = month.byRole.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      year: month._id.year,
      month: month._id.month,
      total: month.count,
      byRole: roleCount
    };
  });
};

// Helper function for food distribution report
const getFoodDistributionReport = async () => {
  // Get distribution by category
  const byCategory = await Food.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status'
          }
        }
      }
    }
  ]);

  // Get distribution by status
  const byStatus = await Food.aggregate([
    {
      $group: {
        _id: '$status',
        total: { $sum: 1 },
        byCategory: {
          $push: {
            category: '$category'
          }
        }
      }
    }
  ]);

  // Process to get counts by status for each category
  const processedByCategory = byCategory.map(category => {
    const statusCount = category.byStatus.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      category: category._id,
      total: category.total,
      byStatus: statusCount
    };
  });

  // Process to get counts by category for each status
  const processedByStatus = byStatus.map(status => {
    const categoryCount = status.byCategory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      status: status._id,
      total: status.total,
      byCategory: categoryCount
    };
  });

  return {
    byCategory: processedByCategory,
    byStatus: processedByStatus
  };
};

// Helper function for activity summary report
const getActivitySummaryReport = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get monthly activity counts
  const monthlyActivity = await Food.aggregate([
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
        donations: { $sum: 1 },
        claimed: {
          $sum: {
            $cond: [{ $ne: ['$claimedBy', null] }, 1, 0]
          }
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        expired: {
          $sum: {
            $cond: [{ $eq: ['$status', 'expired'] }, 1, 0]
          }
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get average time between donation and claim
  const claimTimeData = await Food.aggregate([
    {
      $match: {
        claimedAt: { $exists: true, $ne: null }
      }
    },
    {
      $project: {
        timeToClaim: {
          $divide: [
            { $subtract: ['$claimedAt', '$createdAt'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTimeToClaim: { $avg: '$timeToClaim' },
        minTimeToClaim: { $min: '$timeToClaim' },
        maxTimeToClaim: { $max: '$timeToClaim' }
      }
    }
  ]);

  // Format monthly activity
  const formattedMonthlyActivity = monthlyActivity.map(month => ({
    year: month._id.year,
    month: month._id.month,
    donations: month.donations,
    claimed: month.claimed,
    completed: month.completed,
    expired: month.expired,
    cancelled: month.cancelled,
    claimRate: month.donations > 0 ? (month.claimed / month.donations) * 100 : 0,
    completionRate: month.claimed > 0 ? (month.completed / month.claimed) * 100 : 0
  }));

  return {
    monthlyActivity: formattedMonthlyActivity,
    claimTimeMetrics: claimTimeData.length > 0 ? {
      avgTimeToClaim: claimTimeData[0].avgTimeToClaim,
      minTimeToClaim: claimTimeData[0].minTimeToClaim,
      maxTimeToClaim: claimTimeData[0].maxTimeToClaim
    } : {
      avgTimeToClaim: 0,
      minTimeToClaim: 0,
      maxTimeToClaim: 0
    }
  };
};

// Helper function for user engagement report
const getUserEngagementReport = async () => {
  // Get top donors
  const topDonors = await Food.aggregate([
    {
      $group: {
        _id: '$donor',
        donations: { $sum: 1 },
        claimed: {
          $sum: {
            $cond: [{ $ne: ['$claimedBy', null] }, 1, 0]
          }
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { donations: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        donations: 1,
        claimed: 1,
        completed: 1,
        claimRate: {
          $cond: [
            { $gt: ['$donations', 0] },
            { $multiply: [{ $divide: ['$claimed', '$donations'] }, 100] },
            0
          ]
        }
      }
    }
  ]);

  // Get top claimers
  const topClaimers = await Food.aggregate([
    {
      $match: {
        claimedBy: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$claimedBy',
        claimed: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { claimed: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        role: '$user.role',
        claimed: 1,
        completed: 1,
        completionRate: {
          $cond: [
            { $gt: ['$claimed', 0] },
            { $multiply: [{ $divide: ['$completed', '$claimed'] }, 100] },
            0
          ]
        }
      }
    }
  ]);

  return {
    topDonors,
    topClaimers
  };
};
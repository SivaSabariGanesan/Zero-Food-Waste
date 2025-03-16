import Food from '../models/Food.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotificationEmail } from '../utils/emailService.js';
import mongoose from 'mongoose';

// @desc    Create a new food listing
// @route   POST /api/food
// @access  Private (Restaurants only)
export const createFoodListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      quantity,
      quantityUnit,
      expiryDate,
      pickupAddress,
      pickupInstructions,
      pickupTimeStart,
      pickupTimeEnd,
      pickupLocation
    } = req.body;

    // Validate user is a restaurant
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can create food listings' });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Create food listing
    const food = await Food.create({
      title,
      description,
      category,
      quantity,
      quantityUnit,
      expiryDate,
      pickupAddress,
      pickupLocation,
      pickupInstructions,
      pickupTimeStart,
      pickupTimeEnd,
      images,
      donor: req.user.id
    });

    // Find NGOs and orphanages to notify
    const recipients = await User.find({
      role: { $in: ['ngo', 'orphanage'] },
      isVerified: true
    });

    // Create notifications for each recipient
    const notifications = recipients.map(recipient => ({
      recipient: recipient._id,
      type: 'food_listed',
      title: 'New Food Available',
      message: `${req.user.name} has listed new food: ${title}`,
      relatedFood: food._id,
      relatedUser: req.user.id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food listings
// @route   GET /api/food
// @access  Private
export const getFoodListings = async (req, res, next) => {
  try {
    const { 
      status, 
      category, 
      search, 
      near, 
      distance = 10, // default 10km
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, only show available food
      query.status = 'available';
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location if coordinates provided
    if (near) {
      const [lng, lat] = near.split(',').map(coord => parseFloat(coord));
      
      if (!isNaN(lng) && !isNaN(lat)) {
        query.pickupLocation = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: distance * 1000 // convert km to meters
          }
        };
      }
    }

    // For restaurants, only show their own listings
    if (req.user.role === 'restaurant') {
      query.donor = req.user.id;
    }

    // For NGOs, show all available or booked food, or food they've claimed
    if (req.user.role === 'ngo') {
      query.$or = [
        { status: 'available' },
        { status: 'booked' },
        { claimedBy: req.user.id }
      ];
    }

    // For orphanages, show all available food or food they've booked
    if (req.user.role === 'orphanage') {
      query.$or = [
        { status: 'available' },
        { bookedBy: req.user.id }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const food = await Food.find(query)
      .populate('donor', 'name address phone')
      .populate('bookedBy', 'name address phone')
      .populate('claimedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Food.countDocuments(query);

    res.json({
      food,
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

// @desc    Get food listing by ID
// @route   GET /api/food/:id
// @access  Private
export const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('donor', 'name address phone profileImage')
      .populate('bookedBy', 'name address phone profileImage email')
      .populate('claimedBy', 'name address phone profileImage email');

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user has access to this food listing
    const isOwner = food.donor._id.toString() === req.user.id;
    const isBooker = food.bookedBy && food.bookedBy._id.toString() === req.user.id;
    const isClaimer = food.claimedBy && food.claimedBy._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isAvailable = food.status === 'available';
    const isBooked = food.status === 'booked';
    const isNGO = req.user.role === 'ngo';
    const isOrphanage = req.user.role === 'orphanage';

    if (!isOwner && !isBooker && !isClaimer && !isAdmin && !(isAvailable && (isNGO || isOrphanage)) && !(isBooked && isNGO)) {
      return res.status(403).json({ message: 'You do not have permission to view this food listing' });
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Update food listing
// @route   PUT /api/food/:id
// @access  Private (Owner only)
export const updateFoodListing = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the owner
    if (food.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this food listing' });
    }

    // Check if food is already claimed or booked
    if (food.status !== 'available' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot update food that has been booked, claimed or is no longer available' });
    }

    // Process uploaded images
    const images = [...food.images];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Update food listing
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images
      },
      { new: true }
    );

    res.json(updatedFood);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food listing
// @route   DELETE /api/food/:id
// @access  Private (Owner only)
export const deleteFoodListing = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the owner or admin
    if (food.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this food listing' });
    }

    // Check if food is already claimed or booked
    if ((food.status === 'claimed' || food.status === 'booked') && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete food that has been booked or claimed' });
    }

    await food.deleteOne();

    res.json({ message: 'Food listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Book food listing (for orphanages)
// @route   PUT /api/food/:id/book
// @access  Private (Orphanages only)
export const bookFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is an orphanage
    if (req.user.role !== 'orphanage') {
      return res.status(403).json({ message: 'Only orphanages can book food' });
    }

    // Check if food is available
    if (food.status !== 'available') {
      return res.status(400).json({ message: 'This food is no longer available' });
    }

    // Update food status
    food.status = 'booked';
    food.bookedBy = req.user.id;
    food.bookedAt = new Date();

    await food.save();

    // Create notification for the donor
    await Notification.create({
      recipient: food.donor,
      type: 'food_booking',  // Changed from 'food_booked' to 'food_booking'
      title: 'Food Booked',
      message: `${req.user.name} has booked your food listing: ${food.title}`,
      relatedFood: food._id,
      relatedUser: req.user.id
    });

    // Send email notification to the donor
    const donor = await User.findById(food.donor);
    if (donor) {
      await sendNotificationEmail(
        donor,
        'Food Booking Notification',
        `${req.user.name} has booked your food listing: ${food.title}. They will be waiting for an NGO to claim and deliver it.`
      );
    }

    // Notify NGOs about the booking
    const ngos = await User.find({
      role: 'ngo',
      isVerified: true
    });

    // Create notifications for each NGO
    const notifications = ngos.map(ngo => ({
      recipient: ngo._id,
      type: 'food_booked_ngo',
      title: 'Food Booked by Orphanage',
      message: `${req.user.name} has booked food: ${food.title}. You can claim it for delivery.`,
      relatedFood: food._id,
      relatedUser: req.user.id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send email notifications to NGOs
    for (const ngo of ngos) {
      await sendNotificationEmail(
        ngo,
        'Orphanage Food Booking Alert',
        `${req.user.name} has booked food: ${food.title}. You can claim it for delivery to the orphanage. Please check the platform for details.`
      );
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Claim food listing
// @route   PUT /api/food/:id/claim
// @access  Private (NGOs only)
export const claimFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is NGO
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can claim food' });
    }

    // Check if food is available or booked
    if (food.status !== 'available' && food.status !== 'booked') {
      return res.status(400).json({ message: 'This food is no longer available for claiming' });
    }

    // Update food status
    food.status = 'claimed';
    food.claimedBy = req.user.id;
    food.claimedAt = new Date();

    await food.save();

    // Create notification for the donor
    await Notification.create({
      recipient: food.donor,
      type: 'food_claimed',
      title: 'Food Claimed',
      message: `${req.user.name} has claimed your food listing: ${food.title}`,
      relatedFood: food._id,
      relatedUser: req.user.id
    });

    // Send email notification to the donor
    const donor = await User.findById(food.donor);
    if (donor) {
      await sendNotificationEmail(
        donor,
        'Food Claim Notification',
        `${req.user.name} has claimed your food listing: ${food.title}. They will coordinate pickup soon.`
      );
    }

    // If food was booked by an orphanage, notify them
    if (food.bookedBy) {
      // Create notification for the orphanage
      await Notification.create({
        recipient: food.bookedBy,
        type: 'food_claimed_for_orphanage',
        title: 'Food Claimed by NGO',
        message: `${req.user.name} has claimed the food you booked: ${food.title}. They will deliver it to you soon.`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email notification to the orphanage
      const orphanage = await User.findById(food.bookedBy);
      if (orphanage) {
        await sendNotificationEmail(
          orphanage,
          'Food Delivery Update',
          `Good news! ${req.user.name} has claimed the food you booked: ${food.title}. They will coordinate delivery to your location soon.`
        );
      }
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark food as completed (pickup completed)
// @route   PUT /api/food/:id/complete
// @access  Private (Owner or Claimer)
export const completeFoodPickup = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the owner or claimer
    const isOwner = food.donor.toString() === req.user.id;
    const isClaimer = food.claimedBy && food.claimedBy.toString() === req.user.id;

    if (!isOwner && !isClaimer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to complete this food pickup' });
    }

    // Check if food is claimed
    if (food.status !== 'claimed') {
      return res.status(400).json({ message: 'Only claimed food can be marked as completed' });
    }

    // Update food status
    food.status = 'completed';
    food.completedAt = new Date();

    await food.save();

    // Create notifications
    if (isOwner) {
      // Notify claimer
      await Notification.create({
        recipient: food.claimedBy,
        type: 'food_completed',
        title: 'Food Pickup Completed',
        message: `${req.user.name} has marked the food pickup as completed: ${food.title}`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to claimer
      const claimer = await User.findById(food.claimedBy);
      if (claimer) {
        await sendNotificationEmail(
          claimer,
          'Food Pickup Completed',
          `${req.user.name} has confirmed that the food pickup for "${food.title}" is completed. Thank you for your service!`
        );
      }
    } else if (isClaimer) {
      // Notify owner
      await Notification.create({
        recipient: food.donor,
        type: 'food_completed',
        title: 'Food Pickup Completed',
        message: `${req.user.name} has marked the food pickup as completed: ${food.title}`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to donor
      const donor = await User.findById(food.donor);
      if (donor) {
        await sendNotificationEmail(
          donor,
          'Food Pickup Completed',
          `${req.user.name} has confirmed that the food pickup for "${food.title}" is completed. Thank you for your donation!`
        );
      }
    }

    // If food was booked by an orphanage, notify them that delivery is complete
    if (food.bookedBy) {
      await Notification.create({
        recipient: food.bookedBy,
        type: 'food_delivery_completed',
        title: 'Food Delivery Completed',
        message: `The food you booked (${food.title}) has been successfully delivered by ${req.user.name}.`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to orphanage
      const orphanage = await User.findById(food.bookedBy);
      if (orphanage) {
        await sendNotificationEmail(
          orphanage,
          'Food Delivery Completed',
          `Great news! The food you booked (${food.title}) has been successfully delivered by ${req.user.name}. We hope this helps your community!`
        );
      }
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel food claim
// @route   PUT /api/food/:id/cancel-claim
// @access  Private (Claimer only)
export const cancelClaim = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the claimer
    if (!food.claimedBy || food.claimedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to cancel this claim' });
    }

    // Check if food is claimed
    if (food.status !== 'claimed') {
      return res.status(400).json({ message: 'Only claimed food can have its claim cancelled' });
    }

    // If food was booked, revert to booked status, otherwise to available
    if (food.bookedBy) {
      food.status = 'booked';
    } else {
      food.status = 'available';
    }
    
    food.claimedBy = null;
    food.claimedAt = null;

    await food.save();

    // Create notification for the donor
    await Notification.create({
      recipient: food.donor,
      type: 'food_claim_cancelled',
      title: 'Food Claim Cancelled',
      message: `${req.user.name} has cancelled their claim on your food listing: ${food.title}`,
      relatedFood: food._id,
      relatedUser: req.user.id
    });

    // Send email to donor
    const donor = await User.findById(food.donor);
    if (donor) {
      await sendNotificationEmail(
        donor,
        'Food Claim Cancelled',
        `${req.user.name} has cancelled their claim on your food listing: ${food.title}. The food is now available for others to claim.`
      );
    }

    // If food was booked by an orphanage, notify them
    if (food.bookedBy) {
      await Notification.create({
        recipient: food.bookedBy,
        type: 'food_claim_cancelled_orphanage',
        title: 'NGO Cancelled Food Claim',
        message: `${req.user.name} has cancelled their claim on the food you booked: ${food.title}. Another NGO can now claim it.`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to orphanage
      const orphanage = await User.findById(food.bookedBy);
      if (orphanage) {
        await sendNotificationEmail(
          orphanage,
          'Food Delivery Update',
          `${req.user.name} has cancelled their claim on the food you booked: ${food.title}. Don't worry, another NGO can now claim it for delivery to you.`
        );
      }

      // Notify other NGOs that this food is available for claiming again
      const ngos = await User.find({
        role: 'ngo',
        isVerified: true,
        _id: { $ne: req.user.id } // Exclude the current NGO
      });

      // Create notifications for each NGO
      const notifications = ngos.map(ngo => ({
        recipient: ngo._id,
        type: 'food_available_for_claim',
        title: 'Food Available for Claim',
        message: `A previously claimed food item (${food.title}) is now available for claiming. It was booked by an orphanage.`,
        relatedFood: food._id
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel food booking
// @route   PUT /api/food/:id/cancel-booking
// @access  Private (Booker only)
export const cancelBooking = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the booker
    if (!food.bookedBy || food.bookedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to cancel this booking' });
    }

    // Check if food is booked
    if (food.status !== 'booked') {
      return res.status(400).json({ message: 'Only booked food can have its booking cancelled' });
    }

    // Update food status back to available
    food.status = 'available';
    food.bookedBy = null;
    food.bookedAt = null;

    await food.save();

    // Create notification for the donor
    await Notification.create({
      recipient: food.donor,
      type: 'food_booking_cancelled',
      title: 'Food Booking Cancelled',
      message: `${req.user.name} has cancelled their booking on your food listing: ${food.title}`,
      relatedFood: food._id,
      relatedUser: req.user.id
    });

    // Send email to donor
    const donor = await User.findById(food.donor);
    if (donor) {
      await sendNotificationEmail(
        donor,
        'Food Booking Cancelled',
        `${req.user.name} has cancelled their booking on your food listing: ${food.title}. The food is now available for others.`
      );
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel food listing
// @route   PUT /api/food/:id/cancel
// @access  Private (Owner only)
export const cancelFoodListing = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Check if user is the owner
    if (food.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to cancel this food listing' });
    }

    // Check if food is already completed
    if (food.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed food listings' });
    }

    // Update food status
    food.status = 'cancelled';

    await food.save();

    // If food was claimed, notify the claimer
    if (food.claimedBy) {
      await Notification.create({
        recipient: food.claimedBy,
        type: 'food_cancelled',
        title: 'Food Listing Cancelled',
        message: `${req.user.name} has cancelled the food listing you claimed: ${food.title}`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to claimer
      const claimer = await User.findById(food.claimedBy);
      if (claimer) {
        await sendNotificationEmail(
          claimer,
          'Food Listing Cancelled',
          `${req.user.name} has cancelled the food listing you claimed: ${food.title}. Please check the platform for other available food.`
        );
      }
    }

    // If food was booked, notify the booker
    if (food.bookedBy) {
      await Notification.create({
        recipient: food.bookedBy,
        type: 'food_cancelled_orphanage',
        title: 'Food Listing Cancelled',
        message: `${req.user.name} has cancelled the food listing you booked: ${food.title}`,
        relatedFood: food._id,
        relatedUser: req.user.id
      });

      // Send email to booker
      const booker = await User.findById(food.bookedBy);
      if (booker) {
        await sendNotificationEmail(
          booker,
          'Food Listing Cancelled',
          `${req.user.name} has cancelled the food listing you booked: ${food.title}. Please check the platform for other available food.`
        );
      }
    }

    res.json(food);
  } catch (error) {
    next(error);
  }
};

// @desc    Get food statistics
// @route   GET /api/food/stats
// @access  Private (Admin only)
export const getFoodStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access statistics' });
    }

    // Get counts by status
    const statusCounts = await Food.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by category
    const categoryCounts = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get total quantity by unit
    const quantityByUnit = await Food.aggregate([
      { $group: { _id: '$quantityUnit', totalQuantity: { $sum: '$quantity' } } }
    ]);

    // Get counts by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Food.aggregate([
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

    res.json({
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      categoryCounts: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      quantityByUnit: quantityByUnit.reduce((acc, curr) => {
        acc[curr._id] = curr.totalQuantity;
        return acc;
      }, {}),
      monthlyStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO delivery statistics
// @route   GET /api/food/delivery-stats
// @access  Private (NGOs only)
export const getDeliveryStats = async (req, res, next) => {
  try {
    // Check if user is NGO
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can access delivery statistics' });
    }

    // Get all completed deliveries by this NGO
    const completedDeliveries = await Food.find({
      claimedBy: req.user.id,
      status: 'completed'
    })
    .populate('donor', 'name role')
    .populate('bookedBy', 'name role')
    .sort({ completedAt: -1 });

    // Get counts by status for this NGO
    const statusCounts = await Food.aggregate([
      { 
        $match: { 
          claimedBy: new mongoose.Types.ObjectId(req.user.id)
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get counts by orphanage
    const deliveriesByOrphanage = await Food.aggregate([
      { 
        $match: { 
          claimedBy: new mongoose.Types.ObjectId(req.user.id),
          bookedBy: { $ne: null },
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: '$bookedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'orphanage'
        }
      },
      { $unwind: '$orphanage' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$orphanage.name'
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly delivery stats
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyDeliveries = await Food.aggregate([
      { 
        $match: { 
          claimedBy: new mongoose.Types.ObjectId(req.user.id),
          status: 'completed',
          completedAt: { $gte: threeMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$completedAt' }, 
            month: { $month: '$completedAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      completedDeliveries,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      deliveriesByOrphanage,
      monthlyDeliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orphanage booking statistics
// @route   GET /api/food/booking-stats
// @access  Private (Orphanages only)
export const getBookingStats = async (req, res, next) => {
  try {
    // Check if user is orphanage
    if (req.user.role !== 'orphanage') {
      return res.status(403).json({ message: 'Only orphanages can access booking statistics' });
    }

    // Get all bookings by this orphanage
    const bookings = await Food.find({
      bookedBy: req.user.id
    })
    .populate('donor', 'name')
    .populate('claimedBy', 'name')
    .sort({ bookedAt: -1 });

    // Get counts by status for this orphanage
    const statusCounts = await Food.aggregate([
      { 
        $match: { 
          bookedBy: new mongoose.Types.ObjectId(req.user.id)
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get counts by NGO who delivered
    const deliveriesByNGO = await Food.aggregate([
      { 
        $match: { 
          bookedBy: new mongoose.Types.ObjectId(req.user.id),
          claimedBy: { $ne: null },
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: '$claimedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: '$ngo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$ngo.name'
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly booking stats
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyBookings = await Food.aggregate([
      { 
        $match: { 
          bookedBy: new mongoose.Types.ObjectId(req.user.id),
          bookedAt: { $gte: threeMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$bookedAt' }, 
            month: { $month: '$bookedAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      bookings,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      deliveriesByNGO,
      monthlyBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant donation statistics
// @route   GET /api/food/donation-stats
// @access  Private (Restaurants only)
export const getDonationStats = async (req, res, next) => {
  try {
    // Check if user is restaurant
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can access donation statistics' });
    }

    // Get all donations by this restaurant
    const donations = await Food.find({
      donor: req.user.id
    })
    .populate('bookedBy', 'name')
    .populate('claimedBy', 'name')
    .sort({ createdAt: -1 });

    // Get counts by status for this restaurant
    const statusCounts = await Food.aggregate([
      { 
        $match: { 
          donor: new mongoose.Types.ObjectId(req.user.id)
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get counts by category
    const categoryCounts = await Food.aggregate([
      { 
        $match: { 
          donor: new mongoose.Types.ObjectId(req.user.id)
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get counts by orphanage who booked
    const bookingsByOrphanage = await Food.aggregate([
      { 
        $match: { 
          donor: new mongoose.Types.ObjectId(req.user.id),
          bookedBy: { $ne: null }
        } 
      },
      {
        $group: {
          _id: '$bookedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'orphanage'
        }
      },
      { $unwind: '$orphanage' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$orphanage.name'
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get counts by NGO who claimed
    const claimsByNGO = await Food.aggregate([
      { 
        $match: { 
          donor: new mongoose.Types.ObjectId(req.user.id),
          claimedBy: { $ne: null }
        } 
      },
      {
        $group: {
          _id: '$claimedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: '$ngo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$ngo.name'
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly donation stats
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyDonations = await Food.aggregate([
      { 
        $match: { 
          donor: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: threeMonthsAgo }
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

    res.json({
      donations,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      categoryCounts: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      bookingsByOrphanage,
      claimsByNGO,
      monthlyDonations
    });
  } catch (error) {
    next(error);
  }
};
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'food_listed',
        'food_booking',  // Changed from 'food_booked' to 'food_booking'
        'food_booked_ngo',
        'food_claimed',
        'food_claimed_for_orphanage',
        'food_completed',
        'food_delivery_completed',
        'food_expired',
        'food_cancelled',
        'food_claim_cancelled',
        'food_claim_cancelled_orphanage',
        'food_booking_cancelled',
        'food_available_for_claim',
        'account_verified',
        'account_rejected',
        'message_received'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedFood: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
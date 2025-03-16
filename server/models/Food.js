import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Cooked Meals',
        'Fresh Produce',
        'Bakery Items',
        'Canned Goods',
        'Dairy Products',
        'Beverages',
        'Snacks',
        'Other'
      ]
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity']
    },
    quantityUnit: {
      type: String,
      required: [true, 'Please add a unit'],
      enum: ['servings', 'kg', 'items', 'liters', 'boxes', 'packages']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date']
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please add a pickup address']
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    pickupInstructions: {
      type: String
    },
    pickupTimeStart: {
      type: Date,
      required: [true, 'Please add a pickup start time']
    },
    pickupTimeEnd: {
      type: Date,
      required: [true, 'Please add a pickup end time']
    },
    images: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['available', 'booked', 'claimed', 'completed', 'expired', 'cancelled'],
      default: 'available'
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookedAt: {
      type: Date
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create a 2dsphere index on the pickupLocation field
foodSchema.index({ pickupLocation: '2dsphere' });

// Add a method to check if the food is expired
foodSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Middleware to automatically set status to expired if past expiry date
foodSchema.pre('save', function(next) {
  if (this.isModified('expiryDate') || this.isNew) {
    if (new Date() > this.expiryDate) {
      this.status = 'expired';
    }
  }
  next();
});

const Food = mongoose.model('Food', foodSchema);

export default Food;
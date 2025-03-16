import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['admin', 'restaurant', 'ngo', 'orphanage'],
      default: 'restaurant'
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    profileImage: {
      type: String
    },
    documents: [{
      type: String
    }],
    description: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationNotes: {
      type: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-donation')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ email: 'admin@foodshare.com' });
      
      if (adminExists) {
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const adminUser = new User({
          name: 'Admin User',
          email: 'admin@foodshare.com',
          password: hashedPassword,
          role: 'admin',
          address: 'Admin Office',
          phone: '123-456-7890',
          isVerified: true,
          verificationStatus: 'approved'
        });
        
        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@foodshare.com');
        console.log('Password: admin123');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
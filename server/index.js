import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import foodRoutes from './routes/food.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

// Middleware imports
import { errorHandler } from './middleware/errorMiddleware.js';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware.js';

// Config
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded documents and images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io authentication middleware
io.use(socketAuthMiddleware);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Join user to their own room for private messages
  socket.join(socket.userId);
  
  // Join user to appropriate rooms based on role
  if (socket.userRole) {
    socket.join(socket.userRole);
  }
  
  // Handle food listing events
  socket.on('new-food-listing', (data) => {
    // Broadcast to NGOs and orphanages
    io.to('ngo').to('orphanage').emit('food-listed', data);
  });
  
  socket.on('claim-food', (data) => {
    // Notify the restaurant that posted the food
    io.to(data.restaurantId).emit('food-claimed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Error handler middleware
app.use(errorHandler);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-donation')
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});
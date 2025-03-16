import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user info to socket
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
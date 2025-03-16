import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const restaurant = (req, res, next) => {
  if (req.user && req.user.role === 'restaurant') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a restaurant' });
  }
};

export const ngo = (req, res, next) => {
  if (req.user && req.user.role === 'ngo') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an NGO' });
  }
};

export const orphanage = (req, res, next) => {
  if (req.user && req.user.role === 'orphanage') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an orphanage' });
  }
};

export const ngoOrOrphanage = (req, res, next) => {
  if (req.user && (req.user.role === 'ngo' || req.user.role === 'orphanage')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an NGO or orphanage' });
  }
};

export const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({ message: 'Account not verified' });
  }
};
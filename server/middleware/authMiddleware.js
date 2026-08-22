import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';

/**
 * JWT verification middleware.
 * Extracts token from Authorization: Bearer <token> header.
 * Attaches the full user document (minus password) to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const err = new Error('Not authorized — no token provided');
      err.statusCode = 401;
      return next(err);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const err = new Error('Not authorized — user not found');
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

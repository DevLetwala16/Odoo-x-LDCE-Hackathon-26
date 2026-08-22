import User from '../models/User.js';
import LoginData from '../models/LoginData.js';
import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Expense from '../models/Expense.js';
import CommunityPost from '../models/CommunityPost.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, phone, avatar, city, country, additionalInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const err = new Error(
        existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      );
      err.statusCode = 400;
      err.code = 'DUPLICATE_USER';
      return next(err);
    }

    // Creates user in Registrartion_users collection
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      avatar,
      city,
      country,
      additionalInfo,
    });

    // Also record initial login data entry in Login_data collection
    try {
      await LoginData.create({
        user: user._id,
        username: user.username,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || '',
        loginTime: new Date(),
        status: 'success',
      });
    } catch (logErr) {
      console.error('Error logging registration login data:', logErr);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username in Registrartion_users collection
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      // Record failed attempt in Login_data collection
      try {
        await LoginData.create({
          username: username || 'unknown',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
          userAgent: req.headers['user-agent'] || '',
          loginTime: new Date(),
          status: 'failed',
        });
      } catch (logErr) {
        console.error('Error recording failed login data:', logErr);
      }

      const err = new Error('Invalid username or password');
      err.statusCode = 401;
      return next(err);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Record failed attempt in Login_data collection
      try {
        await LoginData.create({
          user: user._id,
          username: user.username,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
          userAgent: req.headers['user-agent'] || '',
          loginTime: new Date(),
          status: 'failed',
        });
      } catch (logErr) {
        console.error('Error recording failed login data:', logErr);
      }

      const err = new Error('Invalid username or password');
      err.statusCode = 401;
      return next(err);
    }

    // Record successful login in Login_data collection
    try {
      await LoginData.create({
        user: user._id,
        username: user.username,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || '',
        loginTime: new Date(),
        status: 'success',
      });
    } catch (logErr) {
      console.error('Error recording login data:', logErr);
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedCities');
    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'city', 'country', 'additionalInfo', 'preferences'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Cascade delete all associated user data
    const trips = await Trip.find({ user: userId });
    const tripIds = trips.map(t => t._id);

    await Stop.deleteMany({ trip: { $in: tripIds } });
    await Expense.deleteMany({ trip: { $in: tripIds } });
    await Trip.deleteMany({ user: userId });
    await CommunityPost.deleteMany({ user: userId });
    await LoginData.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      data: { message: 'Account and all associated data deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
};

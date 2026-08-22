import User from '../models/User.js';
import Trip from '../models/Trip.js';
import City from '../models/City.js';
import Activity from '../models/Activity.js';
import CommunityPost from '../models/CommunityPost.js';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTrips, totalPosts] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      CommunityPost.countDocuments(),
    ]);

    // Top cities by popularity
    const topCities = await City.find().sort({ popularity: -1 }).limit(10);

    // Top activities by rating
    const topActivities = await Activity.find({ isGlobal: true })
      .sort({ rating: -1 })
      .limit(10)
      .populate('city', 'name country');

    // Trips created per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userTrends = await Trip.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalTrips, totalPosts, topCities, topActivities, userTrends },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    // Don't allow deleting self
    if (user._id.toString() === req.user._id.toString()) {
      const err = new Error('Cannot delete your own admin account');
      err.statusCode = 400;
      return next(err);
    }

    await User.findByIdAndDelete(user._id);
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular cities
// @route   GET /api/admin/popular-cities
// @access  Admin
export const getPopularCities = async (req, res, next) => {
  try {
    const cities = await City.find().sort({ popularity: -1 }).limit(20);
    res.json({ success: true, data: { cities } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular activities
// @route   GET /api/admin/popular-activities
// @access  Admin
export const getPopularActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ isGlobal: true })
      .sort({ rating: -1 })
      .limit(20)
      .populate('city', 'name country');
    res.json({ success: true, data: { activities } });
  } catch (err) {
    next(err);
  }
};

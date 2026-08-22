import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Expense from '../models/Expense.js';
import City from '../models/City.js';
import Activity from '../models/Activity.js';
import CommunityPost from '../models/CommunityPost.js';
import LoginData from '../models/LoginData.js';

// @desc    Get comprehensive platform stats OR user-specific analytics
// @route   GET /api/admin/stats?userId=...
// @access  Admin
export const getStats = async (req, res, next) => {
  try {
    const { userId } = req.query;

    // ══════════════════════════════════════════════════════════════
    // IF USER_ID IS SPECIFIED: GENERATE USER-SPECIFIC ANALYTICS
    // ══════════════════════════════════════════════════════════════
    if (userId && userId !== 'all') {
      const targetUser = await User.findById(userId).select('-password');
      if (!targetUser) {
        const err = new Error('User not found');
        err.statusCode = 404;
        return next(err);
      }

      // Fetch user's trips, stops, and expenses
      const userTrips = await Trip.find({ user: userId }).populate({
        path: 'stops',
        populate: { path: 'city' },
      });
      const userTripIds = userTrips.map(t => t._id);

      const [userExpenses, userPosts, userLogins] = await Promise.all([
        Expense.find({ trip: { $in: userTripIds } }),
        CommunityPost.find({ user: userId }),
        LoginData.find({ 
          $or: [{ user: userId }, { username: targetUser.username }] 
        }).sort({ loginTime: -1 }).limit(10),
      ]);

      const totalUserBudget = userTrips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);
      const totalUserExpenses = userExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const avgUserTripCost = userTrips.length > 0 ? Math.round(totalUserBudget / userTrips.length) : 0;

      // 1. User-specific Cost Trends
      const dayData = [
        { label: '00:00', cost: Math.round(avgUserTripCost * 0.05), trips: 0 },
        { label: '06:00', cost: Math.round(avgUserTripCost * 0.15), trips: 1 },
        { label: '12:00', cost: Math.round(avgUserTripCost * 0.40), trips: 1 },
        { label: '18:00', cost: Math.round(avgUserTripCost * 0.30), trips: 1 },
        { label: '23:59', cost: Math.round(avgUserTripCost * 0.10), trips: 0 },
      ];

      const weekData = [
        { label: 'Mon', cost: Math.round(avgUserTripCost * 0.12), trips: 1 },
        { label: 'Tue', cost: Math.round(avgUserTripCost * 0.08), trips: 0 },
        { label: 'Wed', cost: Math.round(avgUserTripCost * 0.20), trips: 1 },
        { label: 'Thu', cost: Math.round(avgUserTripCost * 0.15), trips: 1 },
        { label: 'Fri', cost: Math.round(avgUserTripCost * 0.25), trips: 2 },
        { label: 'Sat', cost: Math.round(avgUserTripCost * 0.35), trips: 2 },
        { label: 'Sun', cost: Math.round(avgUserTripCost * 0.28), trips: 1 },
      ];

      const monthData = [
        { label: 'Week 1', cost: Math.round(totalUserBudget * 0.20), trips: 1 },
        { label: 'Week 2', cost: Math.round(totalUserBudget * 0.25), trips: 1 },
        { label: 'Week 3', cost: Math.round(totalUserBudget * 0.30), trips: 2 },
        { label: 'Week 4', cost: Math.round(totalUserBudget * 0.25), trips: 1 },
      ];

      const yearData = [
        { label: 'Jan', cost: Math.round(totalUserBudget * 0.08), trips: 1 },
        { label: 'Feb', cost: Math.round(totalUserBudget * 0.05), trips: 0 },
        { label: 'Mar', cost: Math.round(totalUserBudget * 0.10), trips: 1 },
        { label: 'Apr', cost: Math.round(totalUserBudget * 0.12), trips: 1 },
        { label: 'May', cost: Math.round(totalUserBudget * 0.15), trips: 2 },
        { label: 'Jun', cost: Math.round(totalUserBudget * 0.18), trips: 2 },
        { label: 'Jul', cost: Math.round(totalUserBudget * 0.14), trips: 1 },
        { label: 'Aug', cost: Math.round(totalUserBudget * 0.20), trips: 2 },
        { label: 'Sep', cost: Math.round(totalUserBudget * 0.10), trips: 1 },
        { label: 'Oct', cost: Math.round(totalUserBudget * 0.12), trips: 1 },
        { label: 'Nov', cost: Math.round(totalUserBudget * 0.16), trips: 1 },
        { label: 'Dec', cost: Math.round(totalUserBudget * 0.22), trips: 2 },
      ];

      // 2. User-specific Category Breakdown
      const categoryMap = {};
      userExpenses.forEach(exp => {
        const cat = exp.category || 'misc';
        categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amount || 0);
      });

      const userCategoryBreakdown = Object.keys(categoryMap).length > 0
        ? Object.keys(categoryMap).map((k, idx) => ({
            name: k.charAt(0).toUpperCase() + k.slice(1),
            value: categoryMap[k],
            color: ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB'][idx % 6],
          }))
        : [
            { name: 'Accommodation', value: Math.round(totalUserBudget * 0.40) || 12000, color: '#0E7C86' },
            { name: 'Transport & Flights', value: Math.round(totalUserBudget * 0.28) || 9000, color: '#F2703C' },
            { name: 'Food & Dining', value: Math.round(totalUserBudget * 0.18) || 6000, color: '#2FA36B' },
            { name: 'Activities & Sightseeing', value: Math.round(totalUserBudget * 0.14) || 4500, color: '#F39C12' },
          ];

      // 3. User Visited / Planned Cities on Map
      const visitedCitiesMap = {};
      userTrips.forEach(t => {
        t.stops?.forEach(s => {
          if (s.city?._id) {
            visitedCitiesMap[s.city._id] = {
              _id: s.city._id,
              name: s.city.name,
              country: s.city.country,
              region: s.city.region,
              latitude: s.city.latitude || 20.0,
              longitude: s.city.longitude || 0.0,
              costIndex: s.city.costIndex || 3,
              popularity: s.city.popularity || 90,
              avgTripCost: s.sectionBudget || (s.city.costIndex * 15000 + 10000),
              imageUrl: s.city.imageUrl,
              description: s.city.description,
            };
          }
        });
      });

      const userMapCities = Object.values(visitedCitiesMap);
      const allCitiesFallback = await City.find().limit(16);

      return res.json({
        success: true,
        data: {
          isUserSpecific: true,
          targetUser,
          totalUsers: 1,
          totalTrips: userTrips.length,
          totalPosts: userPosts.length,
          totalPlatformBudget: totalUserBudget,
          avgTripBudget: avgUserTripCost,
          trends: {
            day: dayData,
            week: weekData,
            month: monthData,
            year: yearData,
          },
          categoryBreakdown: userCategoryBreakdown,
          mapData: userMapCities.length > 0 ? userMapCities : allCitiesFallback.map(c => ({
            _id: c._id,
            name: c.name,
            country: c.country,
            region: c.region,
            latitude: c.latitude || 20.0,
            longitude: c.longitude || 0.0,
            costIndex: c.costIndex,
            popularity: c.popularity,
            avgTripCost: Math.round(c.costIndex * 15000 + (c.popularity * 250)),
            imageUrl: c.imageUrl,
            description: c.description,
          })),
          recentLogins: userLogins,
        },
      });
    }

    // ══════════════════════════════════════════════════════════════
    // GLOBAL PLATFORM-WIDE STATS
    // ══════════════════════════════════════════════════════════════
    const [totalUsers, totalTrips, totalPosts, totalExpensesCount, totalActivitiesCount] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      CommunityPost.countDocuments(),
      Expense.countDocuments(),
      Activity.countDocuments(),
    ]);

    const tripBudgetAgg = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$totalBudget' },
          avgBudget: { $avg: '$totalBudget' },
        },
      },
    ]);

    const totalPlatformBudget = tripBudgetAgg[0]?.totalBudget || 0;
    const avgTripBudget = Math.round(tripBudgetAgg[0]?.avgBudget || 0);

    const dayData = [
      { label: '00:00', cost: 12000, trips: 2 },
      { label: '04:00', cost: 8500, trips: 1 },
      { label: '08:00', cost: 35000, trips: 5 },
      { label: '12:00', cost: 68000, trips: 8 },
      { label: '16:00', cost: 89000, trips: 11 },
      { label: '20:00', cost: 54000, trips: 7 },
      { label: '23:59', cost: 22000, trips: 3 },
    ];

    const weekData = [
      { label: 'Mon', cost: 145000, trips: 14 },
      { label: 'Tue', cost: 180000, trips: 18 },
      { label: 'Wed', cost: 210000, trips: 22 },
      { label: 'Thu', cost: 195000, trips: 19 },
      { label: 'Fri', cost: 310000, trips: 31 },
      { label: 'Sat', cost: 420000, trips: 42 },
      { label: 'Sun', cost: 380000, trips: 38 },
    ];

    const monthData = [
      { label: 'Week 1', cost: 850000, trips: 85 },
      { label: 'Week 2', cost: 980000, trips: 96 },
      { label: 'Week 3', cost: 1120000, trips: 110 },
      { label: 'Week 4', cost: 1350000, trips: 132 },
    ];

    const yearData = [
      { label: 'Jan', cost: 3200000, trips: 310 },
      { label: 'Feb', cost: 2800000, trips: 275 },
      { label: 'Mar', cost: 4100000, trips: 390 },
      { label: 'Apr', cost: 4600000, trips: 440 },
      { label: 'May', cost: 5800000, trips: 550 },
      { label: 'Jun', cost: 6400000, trips: 610 },
      { label: 'Jul', cost: 5900000, trips: 570 },
      { label: 'Aug', cost: 6700000, trips: 640 },
      { label: 'Sep', cost: 4900000, trips: 470 },
      { label: 'Oct', cost: 5500000, trips: 520 },
      { label: 'Nov', cost: 6100000, trips: 580 },
      { label: 'Dec', cost: 7800000, trips: 750 },
    ];

    const expenseCategoryAgg = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const defaultCategories = [
      { name: 'Accommodation', value: 450000, color: '#0E7C86' },
      { name: 'Transport & Flights', value: 380000, color: '#F2703C' },
      { name: 'Food & Dining', value: 290000, color: '#2FA36B' },
      { name: 'Activities & Tours', value: 240000, color: '#F39C12' },
      { name: 'Shopping & Misc', value: 120000, color: '#8E44AD' },
    ];

    const categoryBreakdown = expenseCategoryAgg.length > 0
      ? expenseCategoryAgg.map((c, i) => ({
          name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : 'General',
          value: c.totalAmount || 1000,
          color: ['#0E7C86', '#F2703C', '#2FA36B', '#F39C12', '#8E44AD', '#3498DB'][i % 6],
        }))
      : defaultCategories;

    const allCities = await City.find().sort({ popularity: -1 }).limit(30);
    const mapData = allCities.map((c) => ({
      _id: c._id,
      name: c.name,
      country: c.country,
      region: c.region,
      latitude: c.latitude || 20.0,
      longitude: c.longitude || 0.0,
      costIndex: c.costIndex,
      popularity: c.popularity,
      avgTripCost: Math.round(c.costIndex * 15000 + (c.popularity * 250)),
      imageUrl: c.imageUrl,
      description: c.description,
    }));

    const topCities = allCities.slice(0, 10);
    const topActivities = await Activity.find()
      .sort({ rating: -1, popularity: -1 })
      .limit(10)
      .populate('city', 'name country');

    const recentLogins = await LoginData.find()
      .sort({ loginTime: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        isUserSpecific: false,
        totalUsers,
        totalTrips,
        totalPosts,
        totalExpensesCount,
        totalActivitiesCount,
        totalPlatformBudget,
        avgTripBudget,
        trends: {
          day: dayData,
          week: weekData,
          month: monthData,
          year: yearData,
        },
        categoryBreakdown,
        mapData,
        topCities,
        topActivities,
        recentLogins,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with trip count
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const tripCount = await Trip.countDocuments({ user: u._id });
        const postCount = await CommunityPost.countDocuments({ user: u._id });
        const userObj = u.toObject();
        userObj.tripCount = tripCount;
        userObj.postCount = postCount;
        return userObj;
      })
    );

    res.json({ success: true, data: { users: usersWithStats } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (promote/demote)
// @route   PATCH /api/admin/users/:id/role
// @access  Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      const err = new Error('Invalid role specified');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: { user } });
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

    if (user._id.toString() === req.user._id.toString()) {
      const err = new Error('Cannot delete your own admin account');
      err.statusCode = 400;
      return next(err);
    }

    await Trip.deleteMany({ user: user._id });
    await CommunityPost.deleteMany({ user: user._id });
    await LoginData.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ success: true, data: { message: 'User and associated data deleted' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular cities
// @route   GET /api/admin/popular-cities
// @access  Admin
export const getPopularCities = async (req, res, next) => {
  try {
    const cities = await City.find().sort({ popularity: -1 }).limit(50);
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
    const activities = await Activity.find()
      .sort({ rating: -1, popularity: -1 })
      .limit(50)
      .populate('city', 'name country');
    res.json({ success: true, data: { activities } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get login history logs
// @route   GET /api/admin/login-logs
// @access  Admin
export const getLoginLogs = async (req, res, next) => {
  try {
    const logs = await LoginData.find()
      .sort({ loginTime: -1 })
      .limit(50)
      .populate('user', 'firstName lastName email');
    res.json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

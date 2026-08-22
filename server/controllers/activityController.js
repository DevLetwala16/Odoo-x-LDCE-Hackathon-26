import Activity from '../models/Activity.js';
import Stop from '../models/Stop.js';

// @desc    List/search activities (with filters)
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const { cityId, category, minCost, maxCost, q, sortBy = 'name', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (cityId) filter.city = cityId;
    if (category) filter.category = category;
    if (minCost || maxCost) {
      filter.estimatedCost = {};
      if (minCost) filter.estimatedCost.$gte = Number(minCost);
      if (maxCost) filter.estimatedCost.$lte = Number(maxCost);
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sortBy === 'cost') sortOptions.estimatedCost = 1;
    else if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'duration') sortOptions.duration = 1;
    else sortOptions.name = 1;

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit)
        .populate('city', 'name country'),
      Activity.countDocuments(filter),
    ]);

    res.json({ success: true, data: { activities, total } });
  } catch (err) {
    next(err);
  }
};

// @desc    Add activity to a stop
// @route   POST /api/stops/:stopId/activities
// @access  Private
export const addActivityToStop = async (req, res, next) => {
  try {
    const stop = await Stop.findById(req.params.stopId).populate('trip');
    if (!stop) {
      const err = new Error('Stop not found');
      err.statusCode = 404;
      return next(err);
    }

    if (stop.trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    const { activityId, name, category, estimatedCost, duration, description } = req.body;

    if (activityId) {
      // Add existing activity by ID
      const existingIdStr = activityId.toString();
      const hasActivity = stop.activities.some(a => a.toString() === existingIdStr);
      if (!hasActivity) {
        stop.activities.push(activityId);
        await stop.save();
      }
    } else if (name) {
      // Create new custom activity and automatically link to stop.city
      const newActivity = await Activity.create({
        name,
        description: description || '',
        category: category || 'sightseeing',
        city: req.body.city || stop.city || undefined,
        estimatedCost: Number(estimatedCost) || 0,
        duration: Number(duration) || 60,
        isGlobal: false,
      });
      stop.activities.push(newActivity._id);
      await stop.save();
    } else {
      const err = new Error('Activity details or ID required');
      err.statusCode = 400;
      return next(err);
    }

    const populated = await stop.populate('activities');
    res.json({ success: true, data: { stop: populated } });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove activity from a stop
// @route   DELETE /api/stops/:stopId/activities/:actId
// @access  Private
export const removeActivityFromStop = async (req, res, next) => {
  try {
    const stop = await Stop.findById(req.params.stopId).populate('trip');
    if (!stop) {
      const err = new Error('Stop not found');
      err.statusCode = 404;
      return next(err);
    }

    if (stop.trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    stop.activities = stop.activities.filter(
      (a) => a.toString() !== req.params.actId
    );
    await stop.save();

    const populated = await stop.populate('activities');
    res.json({ success: true, data: { stop: populated } });
  } catch (err) {
    next(err);
  }
};

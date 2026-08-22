import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Expense from '../models/Expense.js';
import CommunityPost from '../models/CommunityPost.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: { trip } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all trips for the logged-in user
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, sortBy = 'createdAt' } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const filter = { user: req.user._id };

    // Text search
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    // Determine sort order
    const sortOptions = {};
    if (sortBy === 'name') sortOptions.name = 1;
    else if (sortBy === 'startDate') sortOptions.startDate = 1;
    else sortOptions.createdAt = -1;

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit)
        .populate({ path: 'stops', populate: { path: 'city' } }),
      Trip.countDocuments(filter),
    ]);

    res.json({ success: true, data: { trips, total } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate({
        path: 'stops',
        populate: [
          { path: 'city' },
          { path: 'activities' },
        ],
      });

    if (!trip) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    // Check ownership
    if (trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized to view this trip');
      err.statusCode = 403;
      return next(err);
    }

    res.json({ success: true, data: { trip } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized to update this trip');
      err.statusCode = 403;
      return next(err);
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({ path: 'stops', populate: [{ path: 'city' }, { path: 'activities' }] });

    res.json({ success: true, data: { trip } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a trip (and its stops + expenses)
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized to delete this trip');
      err.statusCode = 403;
      return next(err);
    }

    // Cascade delete: remove all stops, expenses, and posts for this trip
    await Stop.deleteMany({ trip: trip._id });
    await Expense.deleteMany({ trip: trip._id });
    await CommunityPost.deleteMany({ trip: trip._id });
    await Trip.findByIdAndDelete(trip._id);

    res.json({ success: true, data: { message: 'Trip deleted successfully' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Share a trip (generate public slug)
// @route   POST /api/trips/:id/share
// @access  Private
export const shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const slug = trip.generateShareSlug();
    await trip.save();

    res.json({
      success: true,
      data: { shareSlug: slug, publicUrl: `/shared/${slug}` },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unshare a trip
// @route   DELETE /api/trips/:id/share
// @access  Private
export const unshareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    trip.shareSlug = undefined;
    trip.isPublic = false;
    await trip.save();

    res.json({ success: true, data: { message: 'Trip is now private' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a shared trip by slug (public)
// @route   GET /api/shared/:slug
// @access  Public
export const getSharedTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareSlug: req.params.slug, isPublic: true })
      .populate({
        path: 'stops',
        populate: [{ path: 'city' }, { path: 'activities' }],
      })
      .populate('user', 'firstName lastName avatar');

    if (!trip) {
      const err = new Error('Shared trip not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: { trip } });
  } catch (err) {
    next(err);
  }
};

// @desc    Copy a shared trip into user's own trips
// @route   POST /api/shared/:slug/copy
// @access  Private
export const copySharedTrip = async (req, res, next) => {
  try {
    const original = await Trip.findOne({ shareSlug: req.params.slug, isPublic: true })
      .populate({ path: 'stops', populate: { path: 'activities' } });

    if (!original) {
      const err = new Error('Shared trip not found');
      err.statusCode = 404;
      return next(err);
    }

    // Create a copy of the trip
    const newTrip = await Trip.create({
      user: req.user._id,
      name: `${original.name} (copy)`,
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      totalBudget: original.totalBudget,
    });

    // Copy stops
    for (const stop of original.stops) {
      const newStop = await Stop.create({
        trip: newTrip._id,
        city: stop.city,
        title: stop.title,
        description: stop.description,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        order: stop.order,
        sectionBudget: stop.sectionBudget,
        activities: stop.activities.map((a) => a._id),
      });
      newTrip.stops.push(newStop._id);
    }

    await newTrip.save();

    res.status(201).json({ success: true, data: { trip: newTrip } });
  } catch (err) {
    next(err);
  }
};

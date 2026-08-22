import Stop from '../models/Stop.js';
import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';

// @desc    Add a stop (section) to a trip
// @route   POST /api/trips/:tripId/stops
// @access  Private
export const createStop = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const stop = await Stop.create({
      ...req.body,
      trip: trip._id,
    });

    // Add stop reference to trip
    trip.stops.push(stop._id);
    await trip.save();

    const populated = await stop.populate('city');
    res.status(201).json({ success: true, data: { stop: populated } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a stop
// @route   PUT /api/stops/:id
// @access  Private
export const updateStop = async (req, res, next) => {
  try {
    let stop = await Stop.findById(req.params.id).populate('trip');
    if (!stop) {
      const err = new Error('Stop not found');
      err.statusCode = 404;
      return next(err);
    }

    // Verify ownership through trip
    if (stop.trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    stop = await Stop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('city').populate('activities');

    res.json({ success: true, data: { stop } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a stop
// @route   DELETE /api/stops/:id
// @access  Private
export const deleteStop = async (req, res, next) => {
  try {
    const stop = await Stop.findById(req.params.id).populate('trip');
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

    // Remove stop reference from trip
    await Trip.findByIdAndUpdate(stop.trip._id, {
      $pull: { stops: stop._id },
    });

    // Cascade delete expenses
    await Expense.deleteMany({ stop: stop._id });

    await Stop.findByIdAndDelete(stop._id);

    res.json({ success: true, data: { message: 'Stop deleted' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder stops within a trip
// @route   PATCH /api/trips/:tripId/stops/reorder
// @access  Private
export const reorderStops = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const { stopIds } = req.body;

    // Update the order of each stop and the trip's stops array
    const updates = stopIds.map((id, index) =>
      Stop.findByIdAndUpdate(id, { order: index }, { new: true })
    );
    await Promise.all(updates);

    trip.stops = stopIds;
    await trip.save();

    const stops = await Stop.find({ trip: trip._id })
      .sort('order')
      .populate('city')
      .populate('activities');

    res.json({ success: true, data: { stops } });
  } catch (err) {
    next(err);
  }
};

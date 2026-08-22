import Trip from '../models/Trip.js';

// Get trips that overlap with the requested month
export const getCalendarTrips = async (req, res, next) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Invalid month format. Use YYYY-MM' });
    }

    const [year, monthNum] = month.split('-');
    
    // Calculate first and last day of the month
    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Overlap condition: trip.startDate <= monthEnd AND trip.endDate >= monthStart
    const trips = await Trip.find({
      user: req.user._id,
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart }
    }).sort('startDate');

    const tripBlocks = trips.map(t => ({
      tripId: t._id,
      name: t.name.toUpperCase(),
      startDate: t.startDate,
      endDate: t.endDate
    }));

    res.json({
      success: true,
      data: {
        tripBlocks
      }
    });
  } catch (error) {
    next(error);
  }
};

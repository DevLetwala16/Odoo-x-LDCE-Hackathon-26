import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';

// @desc    Get budget breakdown for a trip
// @route   GET /api/trips/:tripId/budget
// @access  Private
export const getBudget = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const expenses = await Expense.find({ trip: trip._id });

    // Category breakdown
    const breakdown = { transport: 0, accommodation: 0, food: 0, activity: 0, misc: 0 };
    let totalEstimated = 0;

    for (const exp of expenses) {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
      totalEstimated += exp.amount;
    }

    // Per-day breakdown
    const stops = await Stop.find({ trip: trip._id }).sort('order').populate('activities');
    const perDay = [];

    for (const stop of stops) {
      const start = new Date(stop.arrivalDate);
      const end = new Date(stop.departureDate);
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const stopExpenses = expenses.filter((e) => e.stop.toString() === stop._id.toString());
      const stopTotal = stopExpenses.reduce((sum, e) => sum + e.amount, 0);

      perDay.push({
        stopId: stop._id,
        title: stop.title,
        days,
        total: stopTotal,
        avgPerDay: Math.round(stopTotal / days),
      });
    }

    const overBudget = trip.totalBudget > 0 && totalEstimated > trip.totalBudget;

    res.json({
      success: true,
      data: { totalEstimated, breakdown, perDay, overBudget, totalBudget: trip.totalBudget },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add an expense to a trip
// @route   POST /api/trips/:tripId/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const expense = await Expense.create({
      ...req.body,
      trip: trip._id,
    });

    res.status(201).json({ success: true, data: { expense } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all expenses for a trip
// @route   GET /api/trips/:tripId/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Trip not found');
      err.statusCode = 404;
      return next(err);
    }

    const expenses = await Expense.find({ trip: trip._id })
      .sort('date')
      .populate('stop', 'title');

    res.json({ success: true, data: { expenses } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate({
      path: 'trip',
      select: 'user',
    });

    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      return next(err);
    }

    if (expense.trip.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    await Expense.findByIdAndDelete(expense._id);
    res.json({ success: true, data: { message: 'Expense deleted' } });
  } catch (err) {
    next(err);
  }
};

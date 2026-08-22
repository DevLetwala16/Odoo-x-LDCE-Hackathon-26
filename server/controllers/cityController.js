import City from '../models/City.js';
import Activity from '../models/Activity.js';

// @desc    List/search cities
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res, next) => {
  try {
    const { q, country, region, sortBy = 'popularity', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (region) filter.region = { $regex: region, $options: 'i' };

    const sortOptions = {};
    if (sortBy === 'name') sortOptions.name = 1;
    else if (sortBy === 'costIndex') sortOptions.costIndex = 1;
    else sortOptions.popularity = -1;

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const [cities, total] = await Promise.all([
      City.find(filter).sort(sortOptions).skip(skip).limit(parsedLimit),
      City.countDocuments(filter),
    ]);

    res.json({ success: true, data: { cities, total } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get city by ID with its activities
// @route   GET /api/cities/:id
// @access  Public
export const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      const err = new Error('City not found');
      err.statusCode = 404;
      return next(err);
    }

    const activities = await Activity.find({ city: city._id });

    res.json({ success: true, data: { city, activities } });
  } catch (err) {
    next(err);
  }
};

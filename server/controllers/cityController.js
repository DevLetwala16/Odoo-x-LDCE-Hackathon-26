import City from '../models/City.js';
import Activity from '../models/Activity.js';

// @desc    List/search cities
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res, next) => {
  try {
    const { q, country, region, sortBy = 'popularity', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
        { region: { $regex: q, $options: 'i' } },
      ];
    }
    if (country && country !== 'All') filter.country = { $regex: `^${country}$`, $options: 'i' };
    if (region && region !== 'All') filter.region = { $regex: region, $options: 'i' };

    const sortOptions = {};
    if (sortBy === 'name') sortOptions.name = 1;
    else if (sortBy === 'costIndex') sortOptions.costIndex = 1;
    else sortOptions.popularity = -1;

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
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

// @desc    Get all countries with their top cities
// @route   GET /api/cities/countries
// @access  Public
export const getCountries = async (req, res, next) => {
  try {
    const countriesGrouped = await City.aggregate([
      {
        $group: {
          _id: '$country',
          country: { $first: '$country' },
          region: { $first: '$region' },
          coverImage: { $first: '$imageUrl' },
          cityCount: { $sum: 1 },
          cities: {
            $push: {
              _id: '$_id',
              name: '$name',
              popularity: '$popularity',
              imageUrl: '$imageUrl',
              costIndex: '$costIndex',
              description: '$description',
            },
          },
        },
      },
      { $sort: { country: 1 } },
    ]);

    res.json({ success: true, data: { countries: countriesGrouped } });
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

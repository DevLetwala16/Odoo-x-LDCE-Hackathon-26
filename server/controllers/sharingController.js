import { v4 as uuidv4 } from 'uuid';
import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Activity from '../models/Activity.js';
import City from '../models/City.js';

// Set a trip as public and generate a shareable slug
export const shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!trip.publicSlug) {
      trip.publicSlug = uuidv4().replace(/-/g, '').substring(0, 10);
    }
    trip.isPublic = true;

    await trip.save();

    res.json({
      success: true,
      publicSlug: trip.publicSlug,
      shareUrl: `/shared/${trip.publicSlug}`,
    });
  } catch (error) {
    next(error);
  }
};

// Public read-only itinerary view
export const viewPublicTrip = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const trip = await Trip.findOne({ publicSlug: slug, isPublic: true });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Public trip not found' });
    }

    const stops = await Stop.find({ trip: trip._id })
      .populate('city', 'name country imageUrl')
      .populate({
        path: 'activities',
        populate: { path: 'activity', select: 'name category cost' }
      })
      .sort('orderIndex');

    // Build the itinerary view format
    const tripResp = {
      _id: trip._id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      totalBudget: trip.totalBudget
    };

    const stopsResp = [];
    let globalDayCounter = 1;

    for (const stop of stops) {
      const cityResp = stop.city ? {
        _id: stop.city._id,
        name: stop.city.name,
        country: stop.city.country,
        imageUrl: stop.city.imageUrl
      } : null;

      const numDays = Math.ceil((new Date(stop.endDate) - new Date(stop.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const daysResp = [];

      for (let dayOffset = 0; dayOffset < numDays; dayOffset++) {
        const currentDate = new Date(stop.startDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);
        const dayLabel = `Day ${globalDayCounter++}`;
        
        const dayActivities = [];
        if (stop.activities) {
          for (const sa of stop.activities) {
            const saDate = new Date(sa.scheduledDate);
            if (saDate.toDateString() === currentDate.toDateString()) {
              const baseAct = sa.activity || {};
              const cost = sa.costOverride !== undefined ? sa.costOverride : baseAct.cost;
              dayActivities.push({
                _id: sa._id,
                name: baseAct.name || "Unknown Activity",
                scheduledTime: sa.scheduledTime,
                cost: cost,
                category: baseAct.category
              });
            }
          }
        }

        daysResp.push({
          dayLabel,
          date: currentDate.toISOString(),
          activities: dayActivities,
        });
      }

      stopsResp.push({
        _id: stop._id,
        city: cityResp,
        startDate: stop.startDate,
        endDate: stop.endDate,
        sectionBudget: stop.sectionBudget,
        days: daysResp,
      });
    }

    res.json({
      success: true,
      data: {
        trip: tripResp,
        stops: stopsResp
      }
    });
  } catch (error) {
    next(error);
  }
};

// Clone a public trip into the current user's account
export const copyPublicTrip = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const original = await Trip.findOne({ publicSlug: slug, isPublic: true });
    
    if (!original) {
      return res.status(404).json({ success: false, message: 'Public trip not found' });
    }

    // Clone the trip
    const newTrip = new Trip({
      user: req.user._id,
      name: `${original.name} (Copy)`,
      startDate: original.startDate,
      endDate: original.endDate,
      coverImage: original.coverImage,
      totalBudget: original.totalBudget,
      isPublic: false
    });
    await newTrip.save();

    // Clone stops and their activities
    const originalStops = await Stop.find({ trip: original._id }).sort('orderIndex');
    
    for (const stop of originalStops) {
      const newActivities = stop.activities.map(sa => ({
        activity: sa.activity,
        scheduledDate: sa.scheduledDate,
        scheduledTime: sa.scheduledTime,
        costOverride: sa.costOverride
      }));

      const newStop = new Stop({
        trip: newTrip._id,
        city: stop.city,
        startDate: stop.startDate,
        endDate: stop.endDate,
        sectionBudget: stop.sectionBudget,
        orderIndex: stop.orderIndex,
        activities: newActivities
      });
      await newStop.save();
    }

    res.json({ success: true, newTripId: newTrip._id });
  } catch (error) {
    next(error);
  }
};

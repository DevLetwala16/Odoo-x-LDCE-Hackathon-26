import express from 'express';
import { getCalendarTrips } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected: Get calendar blocks for a specific month
router.get('/', protect, getCalendarTrips);

export default router;

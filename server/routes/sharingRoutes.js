import express from 'express';
import { shareTrip, viewPublicTrip, copyPublicTrip } from '../controllers/sharingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected: Set a trip as public and generate a shareable slug
router.post('/trips/:tripId/share', protect, shareTrip);

// Public: Read-only itinerary view - NO AUTH REQUIRED
router.get('/public/trips/:slug', viewPublicTrip);

// Protected: Clone a public trip into the current user's account
router.post('/public/trips/:slug/copy', protect, copyPublicTrip);

export default router;

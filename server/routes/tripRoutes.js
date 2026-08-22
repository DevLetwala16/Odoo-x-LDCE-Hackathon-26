import { Router } from 'express';
import {
  createTrip, getTrips, getTripById, updateTrip, deleteTrip,
  shareTrip, unshareTrip, getSharedTrip, copySharedTrip,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Shared/public routes (mounted under /api/trips but also /api/shared)
router.get('/shared/:slug', getSharedTrip);
router.post('/shared/:slug/copy', protect, copySharedTrip);

// Trip CRUD
router.route('/')
  .post(protect, createTrip)
  .get(protect, getTrips);

router.route('/:id')
  .get(protect, getTripById)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

// Share/unshare
router.post('/:id/share', protect, shareTrip);
router.delete('/:id/share', protect, unshareTrip);

export default router;

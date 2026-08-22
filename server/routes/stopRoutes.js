import { Router } from 'express';
import { createStop, updateStop, deleteStop, reorderStops } from '../controllers/stopController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Nested under /api/trips/:tripId/stops — handled via app.use mounting
router.post('/trips/:tripId/stops', protect, createStop);
router.patch('/trips/:tripId/stops/reorder', protect, reorderStops);

// Direct stop operations
router.put('/:id', protect, updateStop);
router.delete('/:id', protect, deleteStop);

export default router;

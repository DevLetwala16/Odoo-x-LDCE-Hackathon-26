import { Router } from 'express';
import { getActivities, addActivityToStop, removeActivityFromStop } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getActivities);
router.post('/stops/:stopId/activities', protect, addActivityToStop);
router.delete('/stops/:stopId/activities/:actId', protect, removeActivityFromStop);

export default router;

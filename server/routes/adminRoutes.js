import { Router } from 'express';
import { getStats, getUsers, deleteUser, getPopularCities, getPopularActivities } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(protect, isAdmin); // All admin routes require auth + admin role

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/popular-cities', getPopularCities);
router.get('/popular-activities', getPopularActivities);

export default router;

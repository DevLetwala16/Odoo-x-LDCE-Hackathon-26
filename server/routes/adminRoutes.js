import { Router } from 'express';
import { 
  getStats, 
  getUsers, 
  deleteUser, 
  updateUserRole, 
  getPopularCities, 
  getPopularActivities,
  getLoginLogs 
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(protect, isAdmin); // All admin routes require auth + admin role

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/popular-cities', getPopularCities);
router.get('/popular-activities', getPopularActivities);
router.get('/login-logs', getLoginLogs);

export default router;

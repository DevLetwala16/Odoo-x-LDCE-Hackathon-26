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

// /stats is accessible to all logged-in users (returns personal data for normal users, platform-wide for admin)
router.get('/stats', protect, getStats);
router.get('/popular-cities', protect, getPopularCities);
router.get('/popular-activities', protect, getPopularActivities);

// Admin-only management endpoints
router.get('/users', protect, isAdmin, getUsers);
router.patch('/users/:id/role', protect, isAdmin, updateUserRole);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/login-logs', protect, getLoginLogs); // Returns personal logs for user, all logs for admin

export default router;

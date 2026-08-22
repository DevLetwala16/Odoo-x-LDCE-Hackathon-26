import { Router } from 'express';
import { 
  getStats, 
  getUsers, 
  deleteUser, 
  updateUserRole, 
  getPopularCities, 
  getPopularActivities,
  getLoginLogs,
  getAdminOverview,
  toggleUserAdmin,
  getAdminCities,
  createCity,
  updateCity,
  deleteCity,
  createActivity,
  deleteActivity
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Stats/Logs endpoints
router.get('/stats', protect, getStats);
router.get('/popular-cities', protect, getPopularCities);
router.get('/popular-activities', protect, getPopularActivities);
router.get('/login-logs', protect, getLoginLogs); // Returns personal logs for user, all logs for admin

// Admin-only management endpoints
router.get('/overview', protect, isAdmin, getAdminOverview);
router.get('/users', protect, isAdmin, getUsers);
router.put('/users/:id/toggle-admin', protect, isAdmin, toggleUserAdmin);
router.patch('/users/:id/role', protect, isAdmin, updateUserRole);
router.delete('/users/:id', protect, isAdmin, deleteUser);

// Destination & Activity CRUD
router.get('/cities', protect, isAdmin, getAdminCities);
router.post('/cities', protect, isAdmin, createCity);
router.put('/cities/:id', protect, isAdmin, updateCity);
router.delete('/cities/:id', protect, isAdmin, deleteCity);

router.post('/activities', protect, isAdmin, createActivity);
router.delete('/activities/:id', protect, isAdmin, deleteActivity);

export default router;

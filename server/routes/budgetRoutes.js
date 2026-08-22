import { Router } from 'express';
import { getBudget, createExpense, getExpenses, deleteExpense } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Nested under trips
router.get('/trips/:tripId/budget', protect, getBudget);
router.post('/trips/:tripId/expenses', protect, createExpense);
router.get('/trips/:tripId/expenses', protect, getExpenses);

// Direct expense operations
router.delete('/expenses/:id', protect, deleteExpense);

export default router;

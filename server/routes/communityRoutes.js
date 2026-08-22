import { Router } from 'express';
import { getPosts, getPostById, createPost, updatePost, deletePost, toggleLike } from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(protect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);

export default router;

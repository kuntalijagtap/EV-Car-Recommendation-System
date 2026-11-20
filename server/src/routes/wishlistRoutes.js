import express from 'express';
import {
  addToWishlist,
  checkWishlist,
  getTrendingWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/trending', getTrendingWishlist);
router.use(protect);
router.get('/check/:evId', checkWishlist);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:evId', removeFromWishlist);

export default router;
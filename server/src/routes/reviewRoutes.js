import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEVReview, listEVReviews } from '../controllers/reviewController.js';

const router = express.Router();
router.get('/:evId/reviews', listEVReviews);
router.post('/:evId/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be from 1 to 5.'),
  ...['range', 'comfort', 'chargingExperience', 'buildQuality', 'valueForMoney'].map((key) => body(`categoryRatings.${key}`).isInt({ min: 1, max: 5 }).withMessage(`${key} rating must be from 1 to 5.`)),
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3 to 120 characters.'),
  body('body').trim().isLength({ min: 10, max: 3000 }).withMessage('Review must be 10 to 3000 characters.'),
  body('city').optional().trim().isLength({ min: 2, max: 80 }),
  body('monthsOwned').isInt({ min: 0, max: 600 }).withMessage('Months owned must be between 0 and 600.'),
  body('ownerReportedRealWorldRangeKm').isInt({ min: 20, max: 1200 }).withMessage('Range must be between 20 and 1200 km.'),
  validate,
], createEVReview);

export default router;

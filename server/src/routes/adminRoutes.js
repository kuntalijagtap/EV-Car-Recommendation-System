import express from 'express';
import { body } from 'express-validator';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getAdminOverview, listCatalogNeedsReview, listReviewsForAdmin, moderateReview, verifyCatalogRecord } from '../controllers/reviewController.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/overview', getAdminOverview);
router.get('/catalog-needs-review', listCatalogNeedsReview);
router.patch('/catalog/:evId/verify', verifyCatalogRecord);
router.get('/reviews', listReviewsForAdmin);
router.patch('/reviews/:reviewId', [
  body('status').isIn(['pending', 'published', 'hidden', 'flagged']).withMessage('Choose a valid review status.'),
  body('note').optional().isString().isLength({ max: 300 }).withMessage('Moderation note must be 300 characters or less.'),
  validate,
], moderateReview);

export default router;

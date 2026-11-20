import express from 'express';
import { getEVs, getEVById, getCatalogMetadata, compareEVs, getComparisonVariants, getFeaturedReviews } from '../controllers/evController.js';

const router = express.Router();

router.get('/metadata/filters', getCatalogMetadata);
router.get('/reviews/featured', getFeaturedReviews);
router.get('/compare', compareEVs);
router.get('/compare-variants', getComparisonVariants);
router.get('/', getEVs);
router.get('/:id', getEVById);

export default router;

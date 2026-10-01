import express from 'express';
import { getEVs, getEVById, getCatalogMetadata } from '../controllers/evController.js';

const router = express.Router();

router.get('/metadata/filters', getCatalogMetadata);
router.get('/', getEVs);
router.get('/:id', getEVById);

export default router;

import express from 'express';
import rateLimit from 'express-rate-limit';
import { getRangeAdvice, chat, explainComparison, reviewSummary, myConversations, getConversation, deleteConversation } from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
// AI calls use quota: 20 per minute per IP
router.use(rateLimit({ windowMs: 60 * 1000, max: 20, message: { success: false, message: 'Too many AI requests, please wait a moment.' } }));
router.post('/range-score', getRangeAdvice);
router.post('/chat', optionalAuth, chat);
router.post('/compare-explain', explainComparison);
router.post('/review-summary/:evId', reviewSummary);
router.get('/conversations', protect, myConversations);
router.get('/conversations/:id', protect, getConversation);
router.delete('/conversations/:id', optionalAuth, deleteConversation);
export default router;

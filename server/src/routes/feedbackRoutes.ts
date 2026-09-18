import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, feedbackController.submitFeedback);
router.get('/donation/:donationId', authenticate, feedbackController.getDonationReviews);

export default router;

import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { evaluateReviewSchema } from '../validators/review.validator.js';

const router = Router();

router.use(authenticate);

// Get review by ID
router.get('/:reviewId', reviewController.getReviewById);

// Manager reviews code (Approve or Request Changes)
router.patch(
  '/:reviewId',
  requireManager,
  validate(evaluateReviewSchema),
  reviewController.evaluateReview
);

export default router;

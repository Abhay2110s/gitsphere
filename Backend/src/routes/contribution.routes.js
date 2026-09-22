import { Router } from 'express';
import * as contributionController from '../controllers/contribution.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createContributionSchema,
  requestChangesSchema
} from '../validators/contribution.validator.js';

const router = Router();

// Apply authentication to all contribution routes
router.use(authenticate);

// 1. Submit a new contribution (Developer)
router.post(
  '/',
  validate(createContributionSchema),
  contributionController.createContribution
);

// 2. Get contributions (requires projectId query param)
router.get('/', contributionController.getContributions);

// 3. Get pending reviews for Manager dashboard (Manager only)
router.get('/pending', requireManager, contributionController.getPendingReviews);

// 4. Get single contribution by ID
router.get('/:contributionId', contributionController.getContributionById);

// 5. Approve a contribution (Manager only)
router.patch(
  '/:contributionId/approve',
  requireManager,
  contributionController.approveContribution
);

// 6. Request changes on a contribution (Manager only)
router.patch(
  '/:contributionId/request-changes',
  requireManager,
  validate(requestChangesSchema),
  contributionController.requestChanges
);

export default router;

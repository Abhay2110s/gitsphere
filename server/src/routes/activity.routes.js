import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Get activity logs (with filters and pagination)
router.get('/', activityController.getActivities);

export default router;

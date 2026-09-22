import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';

const router = Router();

router.use(authenticate);

// Manager dashboard (Manager role only)
router.get('/manager', requireManager, dashboardController.getManagerDashboard);

// User dashboard (Accessible to all authenticated users)
router.get('/user', dashboardController.getUserDashboard);

export default router;

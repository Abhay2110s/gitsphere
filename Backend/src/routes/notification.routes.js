import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Get notifications for current user (with pagination and filters)
router.get('/', notificationController.getNotifications);

// Mark all notifications as read (must be before /:id routes)
router.patch('/read-all', notificationController.markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

export default router;

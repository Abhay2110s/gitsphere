import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createMessageSchema } from '../validators/message.validator.js';

const router = Router();

router.use(authenticate);

// Send a message (project or task chat)
router.post('/', validate(createMessageSchema), messageController.createMessage);

// Mark messages as read
router.patch('/read', messageController.markMessagesAsRead);

// Get unread message count
router.get('/unread', messageController.getUnreadCount);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

export default router;

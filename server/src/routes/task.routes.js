import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema
} from '../validators/task.validator.js';
import * as codeController from '../controllers/code.controller.js';
import { createFileSchema } from '../validators/code.validator.js';

const router = Router();

// Apply authentication to all task routes
router.use(authenticate);

// 1. Get current user's assigned tasks
router.get('/my-tasks', taskController.getMyTasks);

// 2. Get specific task details
router.get('/:taskId', taskController.getTaskById);

// 3. Update task core details (Manager only)
router.patch(
  '/:taskId',
  requireManager,
  validate(updateTaskSchema),
  taskController.updateTask
);

// 4. Assign or reassign task (Manager only)
router.patch(
  '/:taskId/assign',
  requireManager,
  validate(assignTaskSchema),
  taskController.assignTask
);

// 5. Update task status (Assigned User or Manager)
router.patch(
  '/:taskId/status',
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);

// 6. Delete task (Manager only)
router.delete('/:taskId', requireManager, taskController.deleteTask);

// 7. Coding Workspace Files for Task
router.post(
  '/:taskId/files',
  validate(createFileSchema),
  codeController.createFile
);

router.get('/:taskId/files', codeController.getFilesByTask);

export default router;

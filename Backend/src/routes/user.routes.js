import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

// Manager only: List / search users to add to projects
router.get('/', authenticate, requireManager, userController.getUsers);

// Authenticated user: Update own profile
router.patch('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

// Authenticated user: Get profile by ID
router.get('/:id', authenticate, userController.getUserById);

export default router;

import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/manager.middleware.js';
import { verifyProjectAccess } from '../middleware/projectAccess.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
} from '../validators/project.validator.js';

const router = Router();

// Apply authentication to all project routes
router.use(authenticate);

// 1. Create project (Manager only)
router.post(
  '/',
  requireManager,
  validate(createProjectSchema),
  projectController.createProject
);

// 2. Get projects (Manager sees created, User sees memberships)
router.get('/', projectController.getProjects);

// 3. Get single project
router.get('/:projectId', verifyProjectAccess, projectController.getProject);

// 4. Update project (Manager only)
router.patch(
  '/:projectId',
  requireManager,
  verifyProjectAccess,
  validate(updateProjectSchema),
  projectController.updateProject
);

// 5. Delete project (Manager only)
router.delete(
  '/:projectId',
  requireManager,
  verifyProjectAccess,
  projectController.deleteProject
);

// 6. Member management (Manager only for add/remove)
router.post(
  '/:projectId/members',
  requireManager,
  verifyProjectAccess,
  validate(addMemberSchema),
  projectController.addMember
);

router.delete(
  '/:projectId/members/:userId',
  requireManager,
  verifyProjectAccess,
  projectController.removeMember
);

router.get(
  '/:projectId/members',
  verifyProjectAccess,
  projectController.getMembers
);

export default router;

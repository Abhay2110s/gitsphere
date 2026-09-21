import { Router } from 'express';
import * as codeController from '../controllers/code.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateFileSchema,
  createVersionSchema
} from '../validators/code.validator.js';

const router = Router();

// Apply authentication to all code routes
router.use(authenticate);

// File routes
router.get('/files/:fileId', codeController.getFileById);
router.patch(
  '/files/:fileId',
  validate(updateFileSchema),
  codeController.updateFile
);
router.delete('/files/:fileId', codeController.deleteFile);

// Version history routes
router.post(
  '/files/:fileId/versions',
  validate(createVersionSchema),
  codeController.createVersion
);
router.get('/files/:fileId/versions', codeController.getVersions);
router.get('/files/:fileId/versions/:versionId', codeController.getVersionById);
router.post(
  '/files/:fileId/restore/:versionId',
  codeController.restoreVersion
);

export default router;

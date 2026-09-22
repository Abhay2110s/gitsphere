import { Router } from 'express';
import * as codeController from '../controllers/code.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateFileSchema,
  createVersionSchema
} from '../validators/code.validator.js';
import * as commentController from '../controllers/comment.controller.js';
import { createCommentSchema } from '../validators/review.validator.js';

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

// Line Comments on Code Files
router.post(
  '/files/:fileId/comments',
  validate(createCommentSchema),
  commentController.createComment
);
router.get('/files/:fileId/comments', commentController.getCommentsByFile);

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

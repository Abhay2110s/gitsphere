import { Router } from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateCommentSchema } from '../validators/review.validator.js';

const router = Router();

router.use(authenticate);

// Update comment
router.patch(
  '/:commentId',
  validate(updateCommentSchema),
  commentController.updateComment
);

// Delete comment
router.delete('/:commentId', commentController.deleteComment);

// Resolve or unresolve comment
router.patch('/:commentId/resolve', commentController.resolveComment);

export default router;

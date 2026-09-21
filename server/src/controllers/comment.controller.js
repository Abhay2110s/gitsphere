import { asyncHandler } from '../utils/asyncHandler.js';
import * as commentService from '../services/comment.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Add line comment on code file
 * @route   POST /api/v1/code/files/:fileId/comments
 * @access  Private (Authorized members / Manager)
 */
export const createComment = asyncHandler(async (req, res) => {
  const { lineNumber, content } = req.body;
  const comment = await commentService.createComment(
    req.params.fileId,
    req.user,
    lineNumber,
    content
  );
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added successfully',
    data: comment
  });
});

/**
 * @desc    Get comments for file
 * @route   GET /api/v1/code/files/:fileId/comments
 * @access  Private (Authorized members / Manager)
 */
export const getCommentsByFile = asyncHandler(async (req, res) => {
  const comments = await commentService.getCommentsByFile(req.params.fileId, req.user);
  return sendSuccess(res, {
    message: 'Comments retrieved successfully',
    data: comments
  });
});

/**
 * @desc    Update comment content
 * @route   PATCH /api/v1/code/comments/:commentId
 * @access  Private (Author only)
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const comment = await commentService.updateComment(req.params.commentId, req.user, content);
  return sendSuccess(res, {
    message: 'Comment updated successfully',
    data: comment
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/code/comments/:commentId
 * @access  Private (Author or Project Manager)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user);
  return sendSuccess(res, {
    message: 'Comment deleted successfully'
  });
});

/**
 * @desc    Resolve or unresolve comment
 * @route   PATCH /api/v1/code/comments/:commentId/resolve
 * @access  Private (Author or Project Manager)
 */
export const resolveComment = asyncHandler(async (req, res) => {
  const comment = await commentService.resolveComment(req.params.commentId, req.user);
  return sendSuccess(res, {
    message: `Comment ${comment.isResolved ? 'resolved' : 'unresolved'} successfully`,
    data: comment
  });
});

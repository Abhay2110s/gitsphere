import mongoose from 'mongoose';
import CodeComment from '../models/CodeComment.js';
import CodeFile from '../models/CodeFile.js';
import { AppError } from '../utils/response.js';
import { hasProjectAccess } from '../middleware/projectAccess.middleware.js';
import { notifyCommentAdded } from './notification.service.js';
import { logActivity } from './activity.service.js';

/**
 * Helper to verify file and project access for comments
 */
const verifyFileForComment = async (fileId, user) => {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new AppError('Invalid File ID format', 400, 'INVALID_ID');
  }

  const file = await CodeFile.findById(fileId).populate({
    path: 'task',
    populate: { path: 'project' }
  });

  if (!file) {
    throw new AppError('File not found', 404, 'NOT_FOUND');
  }

  const task = file.task;
  const project = task.project;

  if (!hasProjectAccess(project, user)) {
    const message =
      user.role === 'MANAGER'
        ? 'Access denied to files outside your projects.'
        : 'Access denied. You are not a member of this project.';
    throw new AppError(message, 403, 'FORBIDDEN');
  }

  return { file, task, project };
};

/**
 * Add a line comment on a code file
 */
export const createComment = async (fileId, user, lineNumber, content) => {
  const { file, task, project } = await verifyFileForComment(fileId, user);

  const comment = await CodeComment.create({
    file: file._id,
    task: task._id,
    user: user._id,
    lineNumber,
    content
  });

  const populated = await comment.populate([
    { path: 'user', select: 'name email avatar role' },
    { path: 'resolvedBy', select: 'name email avatar' }
  ]);

  // Notify relevant users
  notifyCommentAdded({
    file,
    task,
    commentBy: user,
    project
  }).catch(() => {});

  // Log activity
  logActivity({
    user: user._id,
    project: project._id,
    task: task._id,
    action: 'COMMENT_ADDED',
    metadata: { fileName: file.fileName, lineNumber }
  });

  return populated;
};

/**
 * Get all comments for a file
 */
export const getCommentsByFile = async (fileId, user) => {
  await verifyFileForComment(fileId, user);

  const comments = await CodeComment.find({ file: fileId })
    .populate('user', 'name email avatar role')
    .populate('resolvedBy', 'name email avatar')
    .sort({ lineNumber: 1, createdAt: 1 });

  return comments;
};

/**
 * Update comment content (Author only)
 */
export const updateComment = async (commentId, user, content) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid Comment ID format', 400, 'INVALID_ID');
  }

  const comment = await CodeComment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'NOT_FOUND');
  }

  if (!comment.user.equals(user._id)) {
    throw new AppError('You can only edit your own comments.', 403, 'FORBIDDEN');
  }

  comment.content = content;
  await comment.save();

  return comment.populate([
    { path: 'user', select: 'name email avatar role' },
    { path: 'resolvedBy', select: 'name email avatar' }
  ]);
};

/**
 * Delete a comment (Author or Project Manager)
 */
export const deleteComment = async (commentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid Comment ID format', 400, 'INVALID_ID');
  }

  const comment = await CodeComment.findById(commentId).populate({
    path: 'task',
    populate: { path: 'project' }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404, 'NOT_FOUND');
  }

  const isAuthor = comment.user.equals(user._id);
  const isProjectManager =
    user.role === 'MANAGER' && comment.task.project.createdBy.equals(user._id);

  if (!isAuthor && !isProjectManager) {
    throw new AppError('Permission denied to delete this comment.', 403, 'FORBIDDEN');
  }

  await CodeComment.findByIdAndDelete(commentId);
  return { message: 'Comment deleted successfully' };
};

/**
 * Resolve or unresolve a code comment
 */
export const resolveComment = async (commentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid Comment ID format', 400, 'INVALID_ID');
  }

  const comment = await CodeComment.findById(commentId).populate({
    path: 'task',
    populate: { path: 'project' }
  });

  if (!comment) {
    throw new AppError('Comment not found', 404, 'NOT_FOUND');
  }

  const isAuthor = comment.user.equals(user._id);
  const isProjectManager =
    user.role === 'MANAGER' && comment.task.project.createdBy.equals(user._id);

  if (!isAuthor && !isProjectManager) {
    throw new AppError('Only the comment author or project Manager can resolve comments.', 403, 'FORBIDDEN');
  }

  comment.isResolved = !comment.isResolved;
  comment.resolvedBy = comment.isResolved ? user._id : null;
  await comment.save();

  return comment.populate([
    { path: 'user', select: 'name email avatar role' },
    { path: 'resolvedBy', select: 'name email avatar' }
  ]);
};

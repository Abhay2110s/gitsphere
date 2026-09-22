import mongoose from 'mongoose';
import CodeReview from '../models/CodeReview.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/response.js';
import { hasProjectAccess } from '../middleware/projectAccess.middleware.js';
import { notifyCodeSubmitted, notifyCodeReviewed } from './notification.service.js';
import { logActivity } from './activity.service.js';

/**
 * Submit code for review (Assigned User only)
 * Transitions task status to IN_REVIEW and creates a PENDING review record
 */
export const submitReview = async (taskId, user, summary = '') => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Permission: Only the assigned developer can submit code for review
  if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
    throw new AppError('Permission denied. You can only submit code for tasks assigned to you.', 403, 'FORBIDDEN');
  }

  // State constraint
  if (task.status !== 'IN_PROGRESS' && task.status !== 'CHANGES_REQUESTED') {
    throw new AppError(
      `Cannot submit task in "${task.status}" status. Task must be IN_PROGRESS or CHANGES_REQUESTED to submit for review.`,
      400,
      'INVALID_STATUS_FOR_SUBMISSION'
    );
  }

  // Update task status to IN_REVIEW
  task.status = 'IN_REVIEW';
  await task.save();

  // Create review record
  const review = await CodeReview.create({
    task: taskId,
    submittedBy: user._id,
    status: 'PENDING',
    summary
  });

  const populated = await review.populate([
    { path: 'submittedBy', select: 'name email avatar role' },
    { path: 'task', select: 'title status priority' }
  ]);

  // Trigger notification for manager
  notifyCodeSubmitted({
    task,
    submittedBy: user,
    project: task.project
  }).catch(() => {});

  // Log activity
  logActivity({
    user: user._id,
    project: task.project._id || task.project,
    task: task._id,
    action: 'CODE_SUBMITTED',
    metadata: { summary }
  });

  return populated;
};

/**
 * Manager evaluates review (Approve or Request Changes)
 * Rule 9: Only Managers can approve code.
 * Rule 10: Only Managers can request changes.
 * Rule 11: A User cannot approve their own code.
 */
export const evaluateReview = async (reviewId, manager, status, summary = '') => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError('Invalid Review ID format', 400, 'INVALID_ID');
  }

  const review = await CodeReview.findById(reviewId).populate({
    path: 'task',
    populate: { path: 'project' }
  });

  if (!review) {
    throw new AppError('Code review not found', 404, 'NOT_FOUND');
  }

  const task = review.task;
  const project = task.project;

  // Manager ownership check
  if (!project.createdBy.equals(manager._id)) {
    throw new AppError('Access denied. You can only review tasks in projects you created.', 403, 'FORBIDDEN');
  }

  // Rule 11 check: Even if a user somehow had Manager role, cannot review own submission
  if (review.submittedBy.equals(manager._id)) {
    throw new AppError('Users cannot approve or review their own code submissions.', 403, 'FORBIDDEN');
  }

  // Update review status
  review.status = status;
  review.reviewedBy = manager._id;
  review.reviewedAt = new Date();
  if (summary) {
    review.summary = summary;
  }
  await review.save();

  // Synchronize task status
  if (status === 'APPROVED') {
    task.status = 'COMPLETED';
  } else if (status === 'CHANGES_REQUESTED') {
    task.status = 'CHANGES_REQUESTED';
  }
  await task.save();

  const populated = await review.populate([
    { path: 'submittedBy', select: 'name email avatar role' },
    { path: 'reviewedBy', select: 'name email avatar role' },
    { path: 'task', select: 'title status priority' }
  ]);

  // Notify the user who submitted the code
  notifyCodeReviewed({
    task,
    review,
    reviewer: manager,
    submittedById: review.submittedBy._id || review.submittedBy,
    project
  }).catch(() => {});

  // Log activity
  logActivity({
    user: manager._id,
    project: project._id,
    task: task._id,
    action: status === 'APPROVED' ? 'CODE_APPROVED' : 'CHANGES_REQUESTED',
    metadata: { summary, status }
  });

  return populated;
};

/**
 * Get all reviews for a task
 */
export const getReviewsByTask = async (taskId, user) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  const project = task.project;

  if (!hasProjectAccess(project, user)) {
    const message =
      user.role === 'MANAGER'
        ? 'Access denied to reviews outside your projects.'
        : 'Access denied. You are not a member of this project.';
    throw new AppError(message, 403, 'FORBIDDEN');
  }

  const reviews = await CodeReview.find({ task: taskId })
    .populate('submittedBy', 'name email avatar role')
    .populate('reviewedBy', 'name email avatar role')
    .sort({ createdAt: -1 });

  return reviews;
};

/**
 * Get specific review by ID
 */
export const getReviewById = async (reviewId, user) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError('Invalid Review ID format', 400, 'INVALID_ID');
  }

  const review = await CodeReview.findById(reviewId)
    .populate({
      path: 'task',
      populate: { path: 'project' }
    })
    .populate('submittedBy', 'name email avatar role')
    .populate('reviewedBy', 'name email avatar role');

  if (!review) {
    throw new AppError('Code review not found', 404, 'NOT_FOUND');
  }

  const project = review.task.project;

  if (!hasProjectAccess(project, user)) {
    const message =
      user.role === 'MANAGER'
        ? 'Access denied to reviews outside your projects.'
        : 'Access denied. You are not a member of this project.';
    throw new AppError(message, 403, 'FORBIDDEN');
  }

  return review;
};

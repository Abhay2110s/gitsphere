import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { AppError } from '../utils/response.js';
import { getIO } from '../sockets/socket.js';

/**
 * Create a notification and deliver it in real-time via Socket.IO
 * This is the core helper that all trigger functions call.
 *
 * @param {Object} notificationData
 * @param {string} notificationData.user - Recipient user ID
 * @param {string} notificationData.type - Notification type enum
 * @param {string} notificationData.title - Short title
 * @param {string} notificationData.message - Descriptive message
 * @param {string} [notificationData.project] - Related project ID
 * @param {string} [notificationData.task] - Related task ID
 * @param {string} [notificationData.relatedUser] - User who triggered the action
 */
export const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);

  // Populate for real-time delivery
  await notification.populate([
    { path: 'project', select: 'name' },
    { path: 'task', select: 'title' },
    { path: 'relatedUser', select: 'name email avatar' }
  ]);

  // Deliver in real-time via Socket.IO to the recipient's personal room
  try {
    const io = getIO();
    io.to(`user:${notificationData.user}`).emit('notification:new', notification);
  } catch {
    // Socket.IO may not be initialized during tests or seeding
    // Silently continue — notification is still persisted in DB
  }

  return notification;
};

/**
 * Get notifications for the authenticated user with pagination
 */
export const getNotifications = async (userId, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { user: userId };

  // Optional filter by read status
  if (queryParams.isRead === 'true') {
    query.isRead = true;
  } else if (queryParams.isRead === 'false') {
    query.isRead = false;
  }

  // Optional filter by type
  if (queryParams.type) {
    query.type = queryParams.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('project', 'name')
      .populate('task', 'title status')
      .populate('relatedUser', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid Notification ID format', 400, 'INVALID_ID');
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  if (!notification.user.equals(userId)) {
    throw new AppError('You can only manage your own notifications.', 403, 'FORBIDDEN');
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read for the user
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  return { markedCount: result.modifiedCount };
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid Notification ID format', 400, 'INVALID_ID');
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  if (!notification.user.equals(userId)) {
    throw new AppError('You can only delete your own notifications.', 403, 'FORBIDDEN');
  }

  await Notification.findByIdAndDelete(notificationId);
  return { message: 'Notification deleted successfully' };
};

// ============================================================
// Notification Trigger Helpers
// Called from other services when important actions happen.
// Rule 20: Important actions must generate appropriate notifications.
// ============================================================

/**
 * Notify user when assigned to a task
 */
export const notifyTaskAssigned = async ({ task, assignedUserId, managerId, project }) => {
  await createNotification({
    user: assignedUserId,
    type: 'TASK_ASSIGNED',
    title: 'New Task Assigned',
    message: `You have been assigned to task "${task.title}" in project "${project.name}".`,
    project: project._id || project,
    task: task._id || task,
    relatedUser: managerId
  });
};

/**
 * Notify relevant users when task status changes
 */
export const notifyTaskStatusChanged = async ({ task, changedBy, newStatus, project }) => {
  const recipients = [];

  // Notify the assigned user if manager changed status
  if (task.assignedTo && !task.assignedTo.equals(changedBy._id)) {
    recipients.push(task.assignedTo);
  }

  // Notify the project manager if user changed status
  const managerId = project.createdBy._id || project.createdBy;
  if (!managerId.equals(changedBy._id)) {
    recipients.push(managerId);
  }

  for (const recipientId of recipients) {
    await createNotification({
      user: recipientId,
      type: 'TASK_STATUS_CHANGED',
      title: 'Task Status Updated',
      message: `Task "${task.title}" status changed to ${newStatus} by ${changedBy.name}.`,
      project: project._id || project,
      task: task._id || task,
      relatedUser: changedBy._id
    });
  }
};

/**
 * Notify project manager when code is submitted for review
 */
export const notifyCodeSubmitted = async ({ task, submittedBy, project }) => {
  const managerId = project.createdBy._id || project.createdBy;

  await createNotification({
    user: managerId,
    type: 'CODE_SUBMITTED',
    title: 'Code Submitted for Review',
    message: `${submittedBy.name} submitted code for review on task "${task.title}".`,
    project: project._id || project,
    task: task._id || task,
    relatedUser: submittedBy._id
  });
};

/**
 * Notify the submitter when their code is reviewed
 */
export const notifyCodeReviewed = async ({ task, review, reviewer, submittedById, project }) => {
  const statusLabel = review.status === 'APPROVED' ? 'approved' : 'requested changes on';

  await createNotification({
    user: submittedById,
    type: 'CODE_REVIEWED',
    title: 'Code Review Completed',
    message: `${reviewer.name} ${statusLabel} your code on task "${task.title}".`,
    project: project._id || project,
    task: task._id || task,
    relatedUser: reviewer._id
  });
};

/**
 * Notify relevant users when a comment is added to code
 */
export const notifyCommentAdded = async ({ file, task, commentBy, project }) => {
  const recipients = new Set();

  // Notify assigned user
  if (task.assignedTo && !task.assignedTo.equals(commentBy._id)) {
    recipients.add(task.assignedTo.toString());
  }

  // Notify project manager
  const managerId = project.createdBy._id || project.createdBy;
  if (!managerId.equals(commentBy._id)) {
    recipients.add(managerId.toString());
  }

  for (const recipientId of recipients) {
    await createNotification({
      user: recipientId,
      type: 'COMMENT_ADDED',
      title: 'New Code Comment',
      message: `${commentBy.name} commented on "${file.fileName}" in task "${task.title}".`,
      project: project._id || project,
      task: task._id || task,
      relatedUser: commentBy._id
    });
  }
};

/**
 * Notify user when added to a project
 */
export const notifyMemberAdded = async ({ project, addedUserId, managerId }) => {
  await createNotification({
    user: addedUserId,
    type: 'MEMBER_ADDED',
    title: 'Added to Project',
    message: `You have been added to the project "${project.name}".`,
    project: project._id || project,
    relatedUser: managerId
  });
};

/**
 * Notify all project developers when code is approved
 */
export const notifyCodeApproved = async ({ project, contribution, approvedBy }) => {
  for (const memberId of project.members) {
    await createNotification({
      user: memberId,
      type: 'CODE_APPROVED',
      title: 'New Approved Code Available',
      message: `Version ${contribution.version} has been approved by ${approvedBy.name} for project "${project.name}".`,
      project: project._id || project,
      task: contribution.task,
      relatedUser: approvedBy._id
    });
  }
};

/**
 * Notify the developer when changes are requested on their contribution
 */
export const notifyChangesRequested = async ({ task, contribution, manager, developerId, project, comment }) => {
  await createNotification({
    user: developerId,
    type: 'CHANGES_REQUESTED_NOTIFICATION',
    title: 'Changes Requested',
    message: `${manager.name} requested changes on your submission for task "${task.title}": "${comment}"`,
    project: project._id || project,
    task: task._id || task,
    relatedUser: manager._id
  });
};

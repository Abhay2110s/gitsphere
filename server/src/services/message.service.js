import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/response.js';

/**
 * Helper to verify the user is a project member or the project manager
 */
const verifyProjectAccess = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Invalid Project ID format', 400, 'INVALID_ID');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied. You can only chat in projects you created.', 403, 'FORBIDDEN');
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }
  }

  return project;
};

/**
 * Helper to verify the task belongs to the project and user has access
 */
const verifyTaskAccess = async (taskId, projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Make sure the task belongs to the specified project
  if (!task.project.equals(projectId)) {
    throw new AppError('Task does not belong to this project.', 400, 'TASK_PROJECT_MISMATCH');
  }

  return task;
};

/**
 * Send a message to a project or task chat
 * Rule 12: Only project members can participate in project chat
 */
export const createMessage = async (user, { content, project: projectId, task: taskId }) => {
  const project = await verifyProjectAccess(projectId, user);

  // If task-scoped, verify task belongs to this project
  if (taskId) {
    await verifyTaskAccess(taskId, project._id, user);
  }

  const message = await Message.create({
    sender: user._id,
    project: project._id,
    task: taskId || null,
    content,
    readBy: [user._id] // Sender has already read their own message
  });

  return message.populate([
    { path: 'sender', select: 'name email avatar role' }
  ]);
};

/**
 * Get messages for a project (project-level chat only, excludes task-scoped messages)
 * Supports pagination
 */
export const getProjectMessages = async (projectId, user, queryParams = {}) => {
  await verifyProjectAccess(projectId, user);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const query = {
    project: projectId,
    task: null // Only project-level messages (not task-scoped)
  };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments(query)
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get messages for a specific task chat
 * Supports pagination
 */
export const getTaskMessages = async (taskId, user, queryParams = {}) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Verify user has access to the parent project
  await verifyProjectAccess(task.project._id, user);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const query = { task: taskId };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments(query)
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Delete a message (Author or Project Manager)
 */
export const deleteMessage = async (messageId, user) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new AppError('Invalid Message ID format', 400, 'INVALID_ID');
  }

  const message = await Message.findById(messageId).populate({
    path: 'project'
  });

  if (!message) {
    throw new AppError('Message not found', 404, 'NOT_FOUND');
  }

  const isAuthor = message.sender.equals(user._id);
  const isProjectManager =
    user.role === 'MANAGER' && message.project.createdBy.equals(user._id);

  if (!isAuthor && !isProjectManager) {
    throw new AppError('Permission denied. Only the message author or project Manager can delete messages.', 403, 'FORBIDDEN');
  }

  await Message.findByIdAndDelete(messageId);
  return { message: 'Message deleted successfully' };
};

/**
 * Mark messages as read by the current user
 * Marks all unread messages in a project or task chat as read for this user
 */
export const markMessagesAsRead = async (user, { projectId, taskId }) => {
  if (projectId) {
    await verifyProjectAccess(projectId, user);
  }

  const query = {
    readBy: { $ne: user._id } // Only messages not yet read by this user
  };

  if (taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    query.task = taskId;
  } else if (projectId) {
    query.project = projectId;
    query.task = null; // Only project-level messages
  } else {
    throw new AppError('Either projectId or taskId is required', 400, 'MISSING_PARAMS');
  }

  const result = await Message.updateMany(query, {
    $addToSet: { readBy: user._id }
  });

  return { markedCount: result.modifiedCount };
};

/**
 * Get unread message count for the user in a project or task
 */
export const getUnreadCount = async (user, { projectId, taskId }) => {
  const query = {
    readBy: { $ne: user._id },
    sender: { $ne: user._id } // Don't count own messages
  };

  if (taskId) {
    query.task = taskId;
  } else if (projectId) {
    query.project = projectId;
    query.task = null;
  } else {
    throw new AppError('Either projectId or taskId is required', 400, 'MISSING_PARAMS');
  }

  const count = await Message.countDocuments(query);
  return { unreadCount: count };
};

import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/response.js';
import { hasProjectAccess } from '../middleware/projectAccess.middleware.js';
import { getIO } from '../sockets/socket.js';

// 10-day auto-expiry cutoff helper (864,000,000 ms)
const getTenDaysCutoff = () => new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

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

  if (!hasProjectAccess(project, user)) {
    const message =
      user.role === 'MANAGER'
        ? 'Access denied. You can only chat in projects you created.'
        : 'Access denied. You are not a member of this project.';
    throw new AppError(message, 403, 'FORBIDDEN');
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

  // Developer isolation: only participate in chats for tasks assigned to you
  if (user.role !== 'MANAGER') {
    const assignedId = task.assignedTo?._id || task.assignedTo;
    const userId = user._id || user.id;
    const isAssigned =
      assignedId &&
      (assignedId.equals
        ? assignedId.equals(userId)
        : String(assignedId) === String(userId));

    if (!isAssigned) {
      throw new AppError('Access denied. You can only access chat for tasks assigned to you.', 403, 'FORBIDDEN');
    }
  }

  return task;
};

/**
 * Send a message to a project or task chat (supports 1-on-1 individual developer chat)
 * Rule 12: Only project members can participate in project chat
 */
export const createMessage = async (user, data) => {
  const content = (data?.content || '').trim();
  let projectId = data?.project || data?.projectId;
  const taskId = data?.task || data?.taskId;
  let recipientId = data?.recipient || data?.recipientId || null;

  if (!content) {
    throw new AppError('Message content cannot be empty', 400, 'EMPTY_CONTENT');
  }

  // If task-scoped, find task and infer project if not provided
  if (taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
    if (!projectId) {
      projectId = task.project?._id || task.project;
    }
    await verifyProjectAccess(projectId, user);
    await verifyTaskAccess(taskId, projectId, user);
  } else if (projectId) {
    const project = await verifyProjectAccess(projectId, user);

    // If developer sending message, recipient defaults to project manager if not specified
    if (user.role !== 'MANAGER' && !recipientId) {
      recipientId = project.createdBy?._id || project.createdBy;
    }
  } else {
    throw new AppError('Project ID or Task ID is required', 400, 'MISSING_PARAMS');
  }

  const message = await Message.create({
    sender: user._id,
    recipient: recipientId || null,
    project: projectId,
    task: taskId || null,
    content,
    readBy: [user._id] // Sender has already read their own message
  });

  const populated = await message.populate([
    { path: 'sender', select: 'name email avatar role' },
    { path: 'recipient', select: 'name email avatar role' }
  ]);

  // Real-time Socket.IO emission to update recipient's sidebar and active room
  try {
    const io = getIO();
    const roomName = taskId ? `chat:task:${taskId}` : `chat:project:${projectId}`;
    io.to(roomName).emit('chat:message', populated);

    if (recipientId) {
      io.to(`user:${recipientId.toString()}`).emit('message:new', populated);
    } else {
      io.to(`project:${projectId.toString()}`).emit('message:new', populated);
    }
  } catch {
    // Socket.IO may not be active during unit tests
  }

  return populated;
};

/**
 * Get messages for a project (project-level chat only, excludes task-scoped messages)
 * Supports 1-on-1 direct developer communication per project bifurcation
 * Automatically filters out messages older than 10 days
 * Supports pagination
 */
export const getProjectMessages = async (projectId, user, queryParams = {}) => {
  const project = await verifyProjectAccess(projectId, user);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const targetDeveloperId = queryParams.developerId || queryParams.recipient || queryParams.developer;

  const query = {
    project: projectId,
    task: null, // Only project-level messages (not task-scoped)
    createdAt: { $gte: getTenDaysCutoff() }
  };

  if (user.role === 'MANAGER') {
    if (targetDeveloperId && mongoose.Types.ObjectId.isValid(targetDeveloperId)) {
      const devObjId = new mongoose.Types.ObjectId(targetDeveloperId);
      query.$or = [
        { sender: user._id, recipient: devObjId },
        { sender: devObjId, recipient: user._id },
        { sender: devObjId, recipient: null }, // fallback for unassigned recipient
        { sender: user._id, recipient: null }  // general project broadcasts
      ];
    }
  } else {
    // Developer 1-on-1 chat with Manager or fellow developer in that project
    const defaultRecipient = project.createdBy?._id || project.createdBy;
    const targetRecipientId = (targetDeveloperId && mongoose.Types.ObjectId.isValid(targetDeveloperId))
      ? new mongoose.Types.ObjectId(targetDeveloperId)
      : defaultRecipient;

    query.$or = [
      { sender: user._id, recipient: targetRecipientId },
      { sender: targetRecipientId, recipient: user._id },
      { sender: user._id, recipient: null },
      { sender: targetRecipientId, recipient: null }
    ];
  }

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('sender', 'name email avatar role')
      .populate('recipient', 'name email avatar role')
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

  // Developer isolation: only view messages for tasks assigned to you
  if (user.role !== 'MANAGER') {
    const assignedId = task.assignedTo?._id || task.assignedTo;
    const userId = user._id || user.id;
    const isAssigned =
      assignedId &&
      (assignedId.equals
        ? assignedId.equals(userId)
        : String(assignedId) === String(userId));

    if (!isAssigned) {
      throw new AppError('Access denied. You can only view chat for tasks assigned to you.', 403, 'FORBIDDEN');
    }
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const query = {
    task: taskId,
    createdAt: { $gte: getTenDaysCutoff() }
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
 * Marks unread messages in a project, task, by specific IDs, or across all accessible projects
 */
export const markMessagesAsRead = async (user, { projectId, taskId, messageIds } = {}) => {
  const query = {
    readBy: { $ne: user._id }, // Only messages not yet read by this user
    sender: { $ne: user._id },
    createdAt: { $gte: getTenDaysCutoff() }
  };

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    const validIds = messageIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length > 0) {
      query._id = { $in: validIds };
    }
  } else if (taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    query.task = taskId;
  } else if (projectId) {
    await verifyProjectAccess(projectId, user);
    query.project = projectId;
  } else {
    // Mark all accessible unread messages as read across all projects for this user
    let userProjectIds = [];
    if (user.role === 'MANAGER') {
      const managerProjects = await Project.find({ createdBy: user._id }).select('_id').lean();
      userProjectIds = managerProjects.map((p) => p._id);
    } else {
      const memberProjects = await Project.find({ members: user._id }).select('_id').lean();
      userProjectIds = memberProjects.map((p) => p._id);
    }
    query.project = { $in: userProjectIds };
  }

  const result = await Message.updateMany(query, {
    $addToSet: { readBy: user._id }
  });

  return { markedCount: result.modifiedCount };
};

/**
 * Get unread message count for the user in a project, task, or across all accessible projects
 */
export const getUnreadCount = async (user, { projectId, taskId } = {}) => {
  const query = {
    readBy: { $ne: user._id },
    sender: { $ne: user._id }, // Don't count own messages
    createdAt: { $gte: getTenDaysCutoff() }
  };

  if (taskId) {
    query.task = taskId;
  } else if (projectId) {
    query.project = projectId;
    query.task = null;
  } else {
    // Global unread count across all user's accessible projects
    let userProjectIds = [];
    if (user.role === 'MANAGER') {
      const managerProjects = await Project.find({ createdBy: user._id }).select('_id').lean();
      userProjectIds = managerProjects.map((p) => p._id);
    } else {
      const memberProjects = await Project.find({ members: user._id }).select('_id').lean();
      userProjectIds = memberProjects.map((p) => p._id);
    }

    if (userProjectIds.length === 0) {
      return { unreadCount: 0 };
    }

    query.project = { $in: userProjectIds };
    query.$or = [
      { recipient: null },
      { recipient: user._id }
    ];
  }

  const count = await Message.countDocuments(query);
  return { unreadCount: count };
};

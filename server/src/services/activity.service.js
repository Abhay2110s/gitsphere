import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/response.js';
import { getIO } from '../sockets/socket.js';

/**
 * Log a meaningful milestone activity
 *
 * @param {Object} data
 * @param {string|mongoose.Types.ObjectId} data.user - User performing action
 * @param {string|mongoose.Types.ObjectId} [data.project] - Related project
 * @param {string|mongoose.Types.ObjectId} [data.task] - Related task
 * @param {string} data.action - Action description / key
 * @param {Object} [data.metadata] - Extra context
 */
export const logActivity = async ({ user, project = null, task = null, action, metadata = {} }) => {
  try {
    const activity = await ActivityLog.create({
      user,
      project: project ? (project._id || project) : null,
      task: task ? (task._id || task) : null,
      action,
      metadata
    });

    // Populate for socket emission
    await activity.populate([
      { path: 'user', select: 'name email avatar role' },
      { path: 'project', select: 'name' },
      { path: 'task', select: 'title status' }
    ]);

    // Real-time broadcast if socket server is initialized
    try {
      const io = getIO();
      if (project) {
        const pId = (project._id || project).toString();
        io.to(`project:${pId}`).emit('activity:new', activity);
      }
    } catch {
      // Sockets may not be initialized in non-server contexts (e.g. tests, scripts)
    }

    return activity;
  } catch (err) {
    // Activity logging should be non-blocking and fire-and-forget
    console.error('Failed to log activity:', err.message);
    return null;
  }
};

/**
 * Get activity logs accessible to the current user
 *
 * @param {Object} user - Authenticated user
 * @param {Object} queryParams - Filtering and pagination params
 */
export const getActivities = async (user, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // If specific project is requested, verify access
  if (queryParams.projectId) {
    if (!mongoose.Types.ObjectId.isValid(queryParams.projectId)) {
      throw new AppError('Invalid Project ID format', 400, 'INVALID_ID');
    }

    const project = await Project.findById(queryParams.projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'MANAGER') {
      if (!project.createdBy.equals(user._id)) {
        throw new AppError('Access denied to activities for this project', 403, 'FORBIDDEN');
      }
    } else {
      const isMember = project.members.some((m) => m.equals(user._id));
      if (!isMember) {
        throw new AppError('Access denied. You are not a member of this project', 403, 'FORBIDDEN');
      }
    }

    query.project = queryParams.projectId;
  } else {
    // If no project specified, restrict to projects the user is authorized to see
    if (user.role === 'MANAGER') {
      const managedProjects = await Project.find({ createdBy: user._id }).select('_id');
      const projectIds = managedProjects.map((p) => p._id);
      query.$or = [{ project: { $in: projectIds } }, { user: user._id }];
    } else {
      const memberProjects = await Project.find({ members: user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      query.$or = [{ project: { $in: projectIds } }, { user: user._id }];
    }
  }

  // Optional task filter
  if (queryParams.taskId) {
    if (!mongoose.Types.ObjectId.isValid(queryParams.taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    query.task = queryParams.taskId;
  }

  // Optional action filter
  if (queryParams.action) {
    query.action = queryParams.action;
  }

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('user', 'name email avatar role')
      .populate('project', 'name')
      .populate('task', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(query)
  ]);

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

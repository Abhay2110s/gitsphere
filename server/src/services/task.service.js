import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/response.js';

/**
 * Create a new coding task inside a project (Manager only)
 * Rule: Task can only be assigned to a User who belongs to the project.
 */
export const createTask = async (managerId, projectId, taskData) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  // Verify Manager created this project
  if (!project.createdBy.equals(managerId)) {
    throw new AppError('You can only create tasks for projects you created.', 403, 'FORBIDDEN');
  }

  // If assignedTo is provided, validate assignee
  if (taskData.assignedTo) {
    const isMember = project.members.some((memberId) => memberId.equals(taskData.assignedTo));
    if (!isMember) {
      throw new AppError(
        'Task can only be assigned to a User who is enrolled in this project.',
        400,
        'INVALID_ASSIGNEE'
      );
    }

    const assignedUser = await User.findById(taskData.assignedTo);
    if (!assignedUser || assignedUser.role !== 'USER') {
      throw new AppError('Task can only be assigned to a standard User.', 400, 'INVALID_ASSIGNEE_ROLE');
    }
  }

  const task = await Task.create({
    ...taskData,
    project: projectId,
    createdBy: managerId
  });

  return task.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'project', select: 'name status' }
  ]);
};

/**
 * Get tasks in a project with filtering and pagination
 */
export const getTasksByProject = async (user, projectId, queryParams = {}) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  // Access check
  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied to tasks of this project.', 403, 'FORBIDDEN');
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }
  }

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { project: projectId };

  if (queryParams.status) {
    query.status = queryParams.status;
  }
  if (queryParams.priority) {
    query.priority = queryParams.priority;
  }
  if (queryParams.assignedTo) {
    query.assignedTo = queryParams.assignedTo;
  }
  if (queryParams.label) {
    query.labels = queryParams.label;
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single task by ID with access verification
 */
export const getTaskById = async (taskId, user) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar bio')
    .populate('project', 'name description createdBy members status deadline');

  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Access check: User must be Manager creator or project member
  const project = task.project;
  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied to this task.', 403, 'FORBIDDEN');
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this task\'s project.', 403, 'FORBIDDEN');
    }
  }

  return task;
};

/**
 * Get tasks assigned to the current user across all projects
 */
export const getMyTasks = async (user, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { assignedTo: user._id };

  if (queryParams.status) {
    query.status = queryParams.status;
  }
  if (queryParams.priority) {
    query.priority = queryParams.priority;
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name status deadline')
      .sort({ deadline: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update task core details (Manager only)
 */
export const updateTask = async (taskId, managerId, updateData) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Verify Manager owns the project
  if (!task.project.createdBy.equals(managerId)) {
    throw new AppError('You can only update tasks in projects you created.', 403, 'FORBIDDEN');
  }

  // Prevent modifying project or createdBy
  delete updateData.project;
  delete updateData.createdBy;

  // If reassigning through update, delegate to validation
  if (updateData.assignedTo) {
    const isMember = task.project.members.some((m) => m.equals(updateData.assignedTo));
    if (!isMember) {
      throw new AppError('Assignee must be an active project member.', 400, 'INVALID_ASSIGNEE');
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true
  })
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  return updatedTask;
};

/**
 * Assign or reassign a task to a project member (Manager only)
 */
export const assignTask = async (taskId, managerId, assignedUserId) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  if (!task.project.createdBy.equals(managerId)) {
    throw new AppError('You can only assign tasks in projects you created.', 403, 'FORBIDDEN');
  }

  if (assignedUserId) {
    const isMember = task.project.members.some((m) => m.equals(assignedUserId));
    if (!isMember) {
      throw new AppError('Task can only be assigned to a User who belongs to this project.', 400, 'INVALID_ASSIGNEE');
    }

    const assignedUser = await User.findById(assignedUserId);
    if (!assignedUser || assignedUser.role !== 'USER') {
      throw new AppError('Tasks can only be assigned to standard Users.', 400, 'INVALID_ASSIGNEE_ROLE');
    }
  }

  task.assignedTo = assignedUserId || null;
  await task.save();

  return task.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' }
  ]);
};

/**
 * Update task status following strict role-based state machine
 *
 * Rules:
 * - Assigned User can transition:
 *     TODO -> IN_PROGRESS
 *     CHANGES_REQUESTED -> IN_PROGRESS
 *     IN_PROGRESS -> IN_REVIEW
 * - User cannot transition to COMPLETED (Rule 11: Cannot approve own code)
 * - User cannot transition to CHANGES_REQUESTED (Manager only)
 * - Non-assigned Users cannot modify status (Rule 6)
 * - Managers can perform any status transition
 */
export const updateTaskStatus = async (taskId, user, newStatus) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  if (user.role === 'MANAGER') {
    // Verify Manager owns the task's project
    if (!task.project.createdBy.equals(user._id)) {
      throw new AppError('You can only update status for tasks in projects you created.', 403, 'FORBIDDEN');
    }
  } else {
    // User role validations
    if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
      throw new AppError('You can only update the status of tasks assigned to you.', 403, 'FORBIDDEN');
    }

    // Rule 11 & Rule 9: Only Managers can approve code / complete tasks
    if (newStatus === 'COMPLETED') {
      throw new AppError('Users cannot approve their own code or mark tasks as completed.', 403, 'FORBIDDEN');
    }

    // Rule 10: Only Managers can request changes
    if (newStatus === 'CHANGES_REQUESTED') {
      throw new AppError('Only Managers can request changes.', 403, 'FORBIDDEN');
    }

    // Allowed User transitions
    const validUserTransitions = {
      TODO: ['IN_PROGRESS'],
      CHANGES_REQUESTED: ['IN_PROGRESS'],
      IN_PROGRESS: ['IN_REVIEW'],
      IN_REVIEW: [] // Must wait for Manager review
    };

    const allowed = validUserTransitions[task.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${task.status} to ${newStatus} for assigned User. Allowed transitions: ${allowed.join(', ') || 'None (Awaiting Manager review)'}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  task.status = newStatus;
  await task.save();

  return task.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' }
  ]);
};

/**
 * Delete a task (Manager only)
 */
export const deleteTask = async (taskId, managerId) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  if (!task.project.createdBy.equals(managerId)) {
    throw new AppError('You can only delete tasks in projects you created.', 403, 'FORBIDDEN');
  }

  await Task.findByIdAndDelete(taskId);
  return { message: 'Task deleted successfully' };
};

import { asyncHandler } from '../utils/asyncHandler.js';
import * as taskService from '../services/task.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Create new task in project
 * @route   POST /api/v1/projects/:projectId/tasks
 * @access  Private (Manager only)
 */
export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.params.projectId, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created successfully',
    data: task
  });
});

/**
 * @desc    Get tasks in a project with filtering & pagination
 * @route   GET /api/v1/projects/:projectId/tasks
 * @access  Private (Authorized members / Manager)
 */
export const getTasksByProject = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.getTasksByProject(
    req.user,
    req.params.projectId,
    req.query
  );
  return sendSuccess(res, {
    message: 'Tasks retrieved successfully',
    data: tasks,
    pagination
  });
});

/**
 * @desc    Get current user's assigned tasks
 * @route   GET /api/v1/tasks/my-tasks
 * @access  Private
 */
export const getMyTasks = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.getMyTasks(req.user, req.query);
  return sendSuccess(res, {
    message: 'Assigned tasks retrieved successfully',
    data: tasks,
    pagination
  });
});

/**
 * @desc    Get single task details
 * @route   GET /api/v1/tasks/:taskId
 * @access  Private (Authorized members / Manager)
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.user);
  return sendSuccess(res, {
    message: 'Task details retrieved successfully',
    data: task
  });
});

/**
 * @desc    Update task details (title, description, priority, deadline)
 * @route   PATCH /api/v1/tasks/:taskId
 * @access  Private (Manager only)
 */
export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user._id, req.body);
  return sendSuccess(res, {
    message: 'Task updated successfully',
    data: task
  });
});

/**
 * @desc    Assign or reassign task
 * @route   PATCH /api/v1/tasks/:taskId/assign
 * @access  Private (Manager only)
 */
export const assignTask = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const task = await taskService.assignTask(req.params.taskId, req.user._id, assignedTo);
  return sendSuccess(res, {
    message: 'Task assignee updated successfully',
    data: task
  });
});

/**
 * @desc    Update task status (Assigned User or Manager)
 * @route   PATCH /api/v1/tasks/:taskId/status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await taskService.updateTaskStatus(req.params.taskId, req.user, status);
  return sendSuccess(res, {
    message: 'Task status updated successfully',
    data: task
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/v1/tasks/:taskId
 * @access  Private (Manager only)
 */
export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user._id);
  return sendSuccess(res, {
    message: 'Task deleted successfully'
  });
});

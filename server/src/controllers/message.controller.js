import { asyncHandler } from '../utils/asyncHandler.js';
import * as messageService from '../services/message.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Send a message (project or task chat)
 * @route   POST /api/v1/messages
 * @access  Private (Project members / Manager)
 */
export const createMessage = asyncHandler(async (req, res) => {
  const message = await messageService.createMessage(req.user, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Message sent successfully',
    data: message
  });
});

/**
 * @desc    Get project-level chat messages
 * @route   GET /api/v1/projects/:projectId/messages
 * @access  Private (Project members / Manager)
 */
export const getProjectMessages = asyncHandler(async (req, res) => {
  const { messages, pagination } = await messageService.getProjectMessages(
    req.params.projectId,
    req.user,
    req.query
  );
  return sendSuccess(res, {
    message: 'Project messages retrieved successfully',
    data: messages,
    pagination
  });
});

/**
 * @desc    Get task-level chat messages
 * @route   GET /api/v1/tasks/:taskId/messages
 * @access  Private (Project members / Manager)
 */
export const getTaskMessages = asyncHandler(async (req, res) => {
  const { messages, pagination } = await messageService.getTaskMessages(
    req.params.taskId,
    req.user,
    req.query
  );
  return sendSuccess(res, {
    message: 'Task messages retrieved successfully',
    data: messages,
    pagination
  });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/v1/messages/:messageId
 * @access  Private (Author or Project Manager)
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  await messageService.deleteMessage(req.params.messageId, req.user);
  return sendSuccess(res, {
    message: 'Message deleted successfully'
  });
});

/**
 * @desc    Mark messages as read in a project or task chat
 * @route   PATCH /api/v1/messages/read
 * @access  Private (Project members / Manager)
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const result = await messageService.markMessagesAsRead(req.user, req.body);
  return sendSuccess(res, {
    message: 'Messages marked as read',
    data: result
  });
});

/**
 * @desc    Get unread message count for a project or task
 * @route   GET /api/v1/messages/unread
 * @access  Private (Project members / Manager)
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await messageService.getUnreadCount(req.user, req.query);
  return sendSuccess(res, {
    message: 'Unread count retrieved',
    data: result
  });
});

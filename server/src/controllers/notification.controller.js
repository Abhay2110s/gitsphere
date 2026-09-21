import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Get notifications for current user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, unreadCount, pagination } = await notificationService.getNotifications(
    req.user._id,
    req.query
  );
  return sendSuccess(res, {
    message: 'Notifications retrieved successfully',
    data: notifications,
    pagination,
    unreadCount
  });
});

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return sendSuccess(res, {
    message: 'Notification marked as read',
    data: notification
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  return sendSuccess(res, {
    message: 'All notifications marked as read',
    data: result
  });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  return sendSuccess(res, {
    message: 'Notification deleted successfully'
  });
});

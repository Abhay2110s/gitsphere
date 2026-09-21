import { asyncHandler } from '../utils/asyncHandler.js';
import * as activityService from '../services/activity.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Get activity logs accessible to current user
 * @route   GET /api/v1/activity
 * @access  Private
 */
export const getActivities = asyncHandler(async (req, res) => {
  const { activities, pagination } = await activityService.getActivities(req.user, req.query);

  return sendSuccess(res, {
    message: 'Activities retrieved successfully',
    data: activities,
    pagination
  });
});

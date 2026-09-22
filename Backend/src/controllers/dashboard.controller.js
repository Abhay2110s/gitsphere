import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Get Manager Dashboard metrics
 * @route   GET /api/v1/dashboard/manager
 * @access  Private (Manager only)
 */
export const getManagerDashboard = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getManagerDashboard(req.user._id);

  return sendSuccess(res, {
    message: 'Manager dashboard metrics retrieved successfully',
    data: metrics
  });
});

/**
 * @desc    Get User Dashboard metrics
 * @route   GET /api/v1/dashboard/user
 * @access  Private (User & Manager)
 */
export const getUserDashboard = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getUserDashboard(req.user._id);

  return sendSuccess(res, {
    message: 'User dashboard metrics retrieved successfully',
    data: metrics
  });
});

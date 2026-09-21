import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Get all users with search and pagination (For Managers to assign members)
 * @route   GET /api/v1/users
 * @access  Private (Manager only)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const search = req.query.search ? req.query.search.trim() : '';
  const role = req.query.role; // Optional role filter

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role && ['MANAGER', 'USER'].includes(role)) {
    query.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);

  return sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get specific user profile by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  return sendSuccess(res, {
    message: 'User retrieved successfully',
    data: user
  });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

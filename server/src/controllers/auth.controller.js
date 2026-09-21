import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/jwt.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Register a new user (USER role)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatar, bio } = req.body;
  const user = await authService.register({ name, email, password, avatar, bio });
  return sendTokenResponse(res, user, 201, 'User registered successfully');
});

/**
 * @desc    Login user & return JWT in HTTP-only cookie and JSON
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login({ email, password });
  return sendTokenResponse(res, user, 200, 'Login successful');
});

/**
 * @desc    Logout user and clear auth cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, {
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by auth.middleware
  return sendSuccess(res, {
    message: 'Current user profile retrieved',
    data: req.user
  });
});

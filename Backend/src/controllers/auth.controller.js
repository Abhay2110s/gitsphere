import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwt.js';
import { sendSuccess } from '../utils/response.js';
import { sendLoginAlertEmail } from '../services/email.service.js';

/**
 * @desc    Register a new user (strictly USER role)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  const token = generateToken({
    id: user._id,
    userId: user._id,
    role: user.role
  });

  setTokenCookie(res, token);

  const userPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    token,
    user: userPayload,
    data: {
      token,
      user: userPayload
    }
  });
});

/**
 * @desc    Authenticate user credentials and login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);

  const token = generateToken({
    id: user._id,
    userId: user._id,
    role: user.role
  });

  setTokenCookie(res, token);

  // Dispatch login alert email via nodemailer in background
  const loginTime = user.lastSeen || new Date();
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  sendLoginAlertEmail({
    user,
    loginTime,
    ipAddress,
    userAgent
  }).catch((err) => {
    console.error('[Nodemailer] Background dispatch error:', err.message);
  });

  const userPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Login successful',
    token,
    user: userPayload,
    data: {
      token,
      user: userPayload
    }
  });
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id || req.user?.userId;
  const user = await authService.getUserById(userId);

  return sendSuccess(res, {
    message: 'Current user profile retrieved',
    user,
    data: user
  });
});

/**
 * @desc    Log out current user and clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, {
    message: 'Logged out successfully'
  });
});

export {
  registerUser as register,
  loginUser as login
};

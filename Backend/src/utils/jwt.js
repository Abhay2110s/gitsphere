import jwt from 'jsonwebtoken';
import { sendSuccess } from './response.js';

/**
 * Generate a signed JWT token for user payload
 * @param {Object} payload - Data to embed in the token
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Set authentication token in HTTP-only cookie
 * @param {import('express').Response} res - Express response object
 * @param {string} token - Signed JWT token
 */
export const setTokenCookie = (res, token) => {
  const cookieExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRE_DAYS || '7', 10);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Attach token to HTTP-only cookie and send standardized success response
 * @param {import('express').Response} res - Express response object
 * @param {Object} user - User document or sanitized object
 * @param {number} [statusCode=200] - HTTP status code
 * @param {string} [message='Authentication successful'] - Message
 */
export const sendTokenResponse = (res, user, statusCode = 200, message = 'Authentication successful') => {
  // Generate token containing id and role
  const token = generateToken({
    id: user._id || user.id,
    role: user.role
  });

  // Set HTTP-only cookie
  setTokenCookie(res, token);

  // Return clean user object and token
  const sanitizedUser = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete sanitizedUser.password;

  return sendSuccess(res, {
    statusCode,
    message,
    data: {
      user: sanitizedUser,
      token
    }
  });
};

/**
 * Clear the auth token cookie
 * @param {import('express').Response} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

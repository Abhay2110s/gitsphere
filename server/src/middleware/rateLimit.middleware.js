import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

/**
 * Strict rate limiter for sensitive authentication endpoints
 * Allows 20 requests per 15-minute window per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    return sendError(res, {
      statusCode: 429,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      errorCode: 'TOO_MANY_REQUESTS'
    });
  }
});

import { AppError } from '../utils/response.js';

/**
 * Middleware to restrict access exclusively to users with MANAGER role
 */
export const requireManager = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required before checking permissions.', 401, 'UNAUTHORIZED'));
  }

  if (req.user.role !== 'MANAGER') {
    return next(
      new AppError(
        'Access denied. Only project Managers are authorized to perform this action.',
        403,
        'FORBIDDEN'
      )
    );
  }

  next();
};

/**
 * Custom application error class for operational errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Send standard success response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Success']
 * @param {*} [options.data=null]
 * @param {Object|null} [options.pagination=null]
 */
export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, pagination = null } = {}) => {
  const responsePayload = {
    success: true,
    message,
    ...(data !== null && data !== undefined ? { data } : {}),
    ...(pagination ? { pagination } : {})
  };

  return res.status(statusCode).json(responsePayload);
};

/**
 * Send standard error response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message='An unexpected error occurred']
 * @param {string} [options.errorCode='INTERNAL_SERVER_ERROR']
 * @param {*} [options.details=null]
 */
export const sendError = (res, { statusCode = 500, message = 'An unexpected error occurred', errorCode = 'INTERNAL_SERVER_ERROR', details = null } = {}) => {
  const responsePayload = {
    success: false,
    message,
    errorCode,
    ...(details && process.env.NODE_ENV === 'development' ? { details } : {})
  };

  return res.status(statusCode).json(responsePayload);
};

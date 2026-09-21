import { AppError } from '../utils/response.js';

/**
 * Express middleware to validate request payload against a Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => {
        const field = err.path.join('.');
        return field ? `${field}: ${err.message}` : err.message;
      });

      return next(
        new AppError(
          `Validation failed: ${errorMessages.join(', ')}`,
          400,
          'VALIDATION_ERROR',
          errorMessages
        )
      );
    }

    // Replace request data with parsed/sanitized data from Zod
    req[source] = result.data;
    next();
  };
};

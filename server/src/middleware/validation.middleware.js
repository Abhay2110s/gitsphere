/**
 * Simple Express validation middleware wrapper
 * Allows passing validator functions directly: validate(validatorFn) or using validatorFn directly as middleware
 */
export const validate = (validator) => {
  return (req, res, next) => {
    return validator(req, res, next);
  };
};

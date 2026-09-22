import User from '../models/User.js';
import { AppError } from '../utils/response.js';

/**
 * Register a new user.
 * Rule: Public registration is strictly constrained to the USER role.
 */
export const register = async ({ name, email, password, avatar = '', bio = '' }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409, 'DUPLICATE_RESOURCE');
  }

  // Create new user with role USER explicitly hardcoded
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    avatar,
    bio,
    role: 'USER',
    isActive: true,
    lastSeen: new Date()
  });

  return user;
};

/**
 * Authenticate user credentials and return user object
 */
export const login = async ({ email, password }) => {
  // Find user and explicitly include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact your manager.', 403, 'ACCOUNT_DEACTIVATED');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last seen timestamp
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Retrieve user by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }
  return user;
};

/**
 * Update authenticated user's profile
 */
export const updateProfile = async (userId, updateData) => {
  // Prohibit modifying sensitive fields via profile update
  delete updateData.role;
  delete updateData.email;
  delete updateData.password;
  delete updateData.isActive;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  return user;
};

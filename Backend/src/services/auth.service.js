import User from '../models/User.js';
import { AppError } from '../utils/response.js';
import { sendOtpEmail } from './email.service.js';

/**
 * Register a new user and generate a 6-digit verification code.
 * Supports roles: USER (Developer/Contributor) and MANAGER (Project Manager/Team Lead)
 */
export const register = async ({ name, email, password, avatar = '', bio = '', role = 'USER' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail }).select('+password +otp +otpExpires');

  // Allow MANAGER or USER, default to USER
  const validRole = (role && ['MANAGER', 'USER'].includes(String(role).toUpperCase()))
    ? String(role).toUpperCase()
    : 'USER';

  // Generate 6-digit OTP and 10 minute expiration
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  let user;

  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new AppError('An account with this email address already exists. Please sign in.', 409, 'DUPLICATE_RESOURCE');
    }
    // Re-register unverified user
    existingUser.name = name;
    existingUser.password = password;
    existingUser.role = validRole;
    existingUser.otp = otp;
    existingUser.otpExpires = otpExpires;
    user = await existingUser.save();
  } else {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      avatar,
      bio,
      role: validRole,
      isActive: true,
      isEmailVerified: false,
      otp,
      otpExpires,
      lastSeen: new Date()
    });
  }

  // Dispatch OTP email in background
  sendOtpEmail({
    email: user.email,
    name: user.name,
    otp
  }).catch((err) => {
    console.error('[Nodemailer] Background OTP email error:', err.message);
  });

  return { user, otp };
};

/**
 * Verify 6-digit OTP code for a user
 */
export const verifyOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires');

  if (!user) {
    throw new AppError('No account found with this email address.', 404, 'NOT_FOUND');
  }

  if (user.isEmailVerified) {
    return user;
  }

  // Check code expiration
  if (user.otpExpires && new Date() > user.otpExpires) {
    throw new AppError('Verification code has expired. Please request a new code.', 400, 'OTP_EXPIRED');
  }

  // Validate OTP (also accepts 123456 as a universal master code for dev/testing)
  const isMatch = user.otp === String(otp).trim() || String(otp).trim() === '123456';
  if (!isMatch) {
    throw new AppError('Invalid verification code.', 400, 'INVALID_OTP');
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Re-generate and resend OTP verification code
 */
export const resendOtp = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('No account found with this email address.', 404, 'NOT_FOUND');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  // Dispatch OTP email in background
  sendOtpEmail({
    email: user.email,
    name: user.name,
    otp
  }).catch((err) => {
    console.error('[Nodemailer] Background OTP resend error:', err.message);
  });

  return { message: 'New verification code sent successfully', otp };
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

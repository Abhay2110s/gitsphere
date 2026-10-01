import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/response.js';
import { notifyMemberAdded } from './notification.service.js';
import { logActivity } from './activity.service.js';

/**
 * Create a new project (Manager only)
 */
export const createProject = async (managerId, projectData) => {
  const project = await Project.create({
    ...projectData,
    createdBy: managerId,
    members: [] // Members added explicitly
  });

  const populated = await project.populate([
    { path: 'createdBy', select: 'name email avatar' }
  ]);

  logActivity({
    user: managerId,
    project: project._id,
    action: 'PROJECT_CREATED',
    metadata: { projectName: project.name }
  });

  return populated;
};

/**
 * Get all projects accessible to the authenticated user with pagination and filters
 */
export const getProjects = async (user, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // Access filter: Manager sees created or memberships, User sees memberships
  const role = String(user.role || '').toUpperCase();
  if (role === 'MANAGER') {
    query.$or = [{ createdBy: user._id }, { members: user._id }];
  } else {
    query.members = user._id;
  }

  // Optional status filter
  if (queryParams.status) {
    query.status = queryParams.status;
  }

  // Optional search by name
  if (queryParams.search) {
    query.name = { $regex: queryParams.search.trim(), $options: 'i' };
  }

  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query)
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single project with populated relations
 */
export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar bio');

  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  return project;
};

/**
 * Update project details (Manager only)
 */
export const updateProject = async (projectId, updateData) => {
  // Disallow modifying critical structural references via patch
  delete updateData.createdBy;
  delete updateData.members;

  const project = await Project.findByIdAndUpdate(projectId, updateData, {
    new: true,
    runValidators: true
  })
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  return project;
};

/**
 * Delete project (Manager only)
 */
export const deleteProject = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  return project;
};

/**
 * Add a User to project members (Manager only)
 * Rule 1: Manager can add only Users (cannot add another Manager).
 * Rule 2: Cannot add duplicate member.
 */
export const addMember = async (projectId, memberUserIdOrEmail) => {
  if (!memberUserIdOrEmail) {
    throw new AppError('User ID or email address is required', 400, 'INVALID_INPUT');
  }

  let targetUser = null;
  const identifier = String(memberUserIdOrEmail).trim();

  // Try by ObjectId if valid format
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    targetUser = await User.findById(identifier);
  }

  // Try by email
  if (!targetUser) {
    targetUser = await User.findOne({ email: identifier.toLowerCase() });
  }

  if (!targetUser) {
    throw new AppError(
      `User "${identifier}" not found. Please ensure the developer has registered an account.`,
      404,
      'NOT_FOUND'
    );
  }

  // Rule: Only Users can be added to project members
  const targetRole = String(targetUser.role || '').toUpperCase();
  if (targetRole !== 'USER') {
    throw new AppError('Only users with role USER can be added as project members.', 400, 'INVALID_MEMBER_ROLE');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  // Check if user is already a member
  const alreadyMember = project.members.some((id) => id.equals(targetUser._id));
  if (alreadyMember) {
    throw new AppError(`${targetUser.name || targetUser.email} is already a member of this project.`, 409, 'ALREADY_MEMBER');
  }

  project.members.push(targetUser._id);
  await project.save();

  const populated = await project.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar bio' }
  ]);

  // Notify the added user
  notifyMemberAdded({
    project,
    addedUserId: targetUser._id,
    managerId: project.createdBy._id || project.createdBy
  }).catch(() => {});

  // Log milestone activity
  logActivity({
    user: project.createdBy._id || project.createdBy,
    project: project._id,
    action: 'MEMBER_ADDED',
    metadata: { memberId: targetUser._id, memberName: targetUser.name }
  });

  return populated;
};

/**
 * Remove a User from project members (Manager only)
 */
export const removeMember = async (projectId, memberUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  const isMember = project.members.some((id) => id.equals(memberUserId));
  if (!isMember) {
    throw new AppError('User is not a member of this project.', 404, 'MEMBER_NOT_FOUND');
  }

  project.members = project.members.filter((id) => !id.equals(memberUserId));
  await project.save();

  logActivity({
    user: project.createdBy,
    project: project._id,
    action: 'MEMBER_REMOVED',
    metadata: { memberId: memberUserId }
  });

  return project.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar bio' }
  ]);
};

/**
 * Get project members list
 */
export const getMembers = async (projectId) => {
  const project = await Project.findById(projectId).populate('members', 'name email avatar bio lastSeen');
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  return project.members;
};

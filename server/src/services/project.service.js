import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/response.js';

/**
 * Create a new project (Manager only)
 */
export const createProject = async (managerId, projectData) => {
  const project = await Project.create({
    ...projectData,
    createdBy: managerId,
    members: [] // Members added explicitly
  });

  return project.populate([
    { path: 'createdBy', select: 'name email avatar' }
  ]);
};

/**
 * Get all projects accessible to the authenticated user with pagination and filters
 */
export const getProjects = async (user, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // Access filter: Manager sees created, User sees memberships
  if (user.role === 'MANAGER') {
    query.createdBy = user._id;
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
      .limit(limit),
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
export const addMember = async (projectId, memberUserId) => {
  if (!mongoose.Types.ObjectId.isValid(memberUserId)) {
    throw new AppError('Invalid user ID format', 400, 'INVALID_ID');
  }

  const targetUser = await User.findById(memberUserId);
  if (!targetUser) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Rule: Only Users can be added to project members
  if (targetUser.role !== 'USER') {
    throw new AppError('Only users with role USER can be added as project members.', 400, 'INVALID_MEMBER_ROLE');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  // Check if user is already a member
  const alreadyMember = project.members.some((id) => id.equals(memberUserId));
  if (alreadyMember) {
    throw new AppError('This user is already a member of this project.', 409, 'ALREADY_MEMBER');
  }

  project.members.push(memberUserId);
  await project.save();

  return project.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar bio' }
  ]);
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

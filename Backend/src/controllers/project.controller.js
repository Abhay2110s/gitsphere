import { asyncHandler } from '../utils/asyncHandler.js';
import * as projectService from '../services/project.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Create new project
 * @route   POST /api/v1/projects
 * @access  Private (Manager only)
 */
export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user._id, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Project created successfully',
    data: project
  });
});

/**
 * @desc    Get all accessible projects (Manager sees created, User sees memberships)
 * @route   GET /api/v1/projects
 * @access  Private
 */
export const getProjects = asyncHandler(async (req, res) => {
  const { projects, pagination } = await projectService.getProjects(req.user, req.query);
  return sendSuccess(res, {
    message: 'Projects retrieved successfully',
    data: projects,
    pagination
  });
});

/**
 * @desc    Get single project by ID
 * @route   GET /api/v1/projects/:projectId
 * @access  Private (Authorized members / Manager only)
 */
export const getProject = asyncHandler(async (req, res) => {
  // req.project was verified and attached by verifyProjectAccess middleware
  const project = await projectService.getProjectById(req.params.projectId);
  return sendSuccess(res, {
    message: 'Project details retrieved successfully',
    data: project
  });
});

/**
 * @desc    Update project details
 * @route   PATCH /api/v1/projects/:projectId
 * @access  Private (Manager only)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const updatedProject = await projectService.updateProject(req.params.projectId, req.body);
  return sendSuccess(res, {
    message: 'Project updated successfully',
    data: updatedProject
  });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/v1/projects/:projectId
 * @access  Private (Manager only)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.projectId);
  return sendSuccess(res, {
    message: 'Project deleted successfully'
  });
});

/**
 * @desc    Add User to project members
 * @route   POST /api/v1/projects/:projectId/members
 * @access  Private (Manager only)
 */
export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await projectService.addMember(req.params.projectId, userId);
  return sendSuccess(res, {
    message: 'Member added to project successfully',
    data: project
  });
});

/**
 * @desc    Remove User from project members
 * @route   DELETE /api/v1/projects/:projectId/members/:userId
 * @access  Private (Manager only)
 */
export const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(req.params.projectId, req.params.userId);
  return sendSuccess(res, {
    message: 'Member removed from project successfully',
    data: project
  });
});

/**
 * @desc    Get project members
 * @route   GET /api/v1/projects/:projectId/members
 * @access  Private (Authorized members / Manager only)
 */
export const getMembers = asyncHandler(async (req, res) => {
  const members = await projectService.getMembers(req.params.projectId);
  return sendSuccess(res, {
    message: 'Project members retrieved successfully',
    data: members
  });
});

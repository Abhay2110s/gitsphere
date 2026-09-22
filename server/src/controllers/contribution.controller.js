import { asyncHandler } from '../utils/asyncHandler.js';
import * as contributionService from '../services/contribution.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Submit a new code contribution
 * @route   POST /api/v1/contributions
 * @access  Private (Developer/User only)
 */
export const createContribution = asyncHandler(async (req, res) => {
  const contribution = await contributionService.createContribution(req.user, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Contribution submitted for review successfully',
    data: contribution
  });
});

/**
 * @desc    Get contributions (filtered by query params)
 * @route   GET /api/v1/contributions?projectId=...&status=...&taskId=...
 * @access  Private
 */
export const getContributions = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'projectId query parameter is required'
    });
  }

  const { contributions, pagination } = await contributionService.getContributionsByProject(
    projectId,
    req.user,
    req.query
  );

  return sendSuccess(res, {
    message: 'Contributions retrieved successfully',
    data: contributions,
    pagination
  });
});

/**
 * @desc    Get all pending (IN_REVIEW) contributions for Manager
 * @route   GET /api/v1/contributions/pending
 * @access  Private (Manager only)
 */
export const getPendingReviews = asyncHandler(async (req, res) => {
  const contributions = await contributionService.getPendingReviews(req.user);
  return sendSuccess(res, {
    message: 'Pending reviews retrieved successfully',
    data: contributions
  });
});

/**
 * @desc    Get a single contribution by ID
 * @route   GET /api/v1/contributions/:contributionId
 * @access  Private
 */
export const getContributionById = asyncHandler(async (req, res) => {
  const contribution = await contributionService.getContributionById(
    req.params.contributionId,
    req.user
  );
  return sendSuccess(res, {
    message: 'Contribution retrieved successfully',
    data: contribution
  });
});

/**
 * @desc    Approve a contribution (Manager only)
 * @route   PATCH /api/v1/contributions/:contributionId/approve
 * @access  Private (Manager only)
 */
export const approveContribution = asyncHandler(async (req, res) => {
  const contribution = await contributionService.approveContribution(
    req.params.contributionId,
    req.user
  );
  return sendSuccess(res, {
    message: `Contribution Version ${contribution.version} approved successfully. Project code has been updated.`,
    data: contribution
  });
});

/**
 * @desc    Request changes on a contribution (Manager only)
 * @route   PATCH /api/v1/contributions/:contributionId/request-changes
 * @access  Private (Manager only)
 */
export const requestChanges = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const contribution = await contributionService.requestChanges(
    req.params.contributionId,
    req.user,
    comment
  );
  return sendSuccess(res, {
    message: 'Changes requested on contribution successfully',
    data: contribution
  });
});

/**
 * @desc    Get latest approved project code
 * @route   GET /api/v1/projects/:projectId/code
 * @access  Private (Project members / Manager)
 */
export const getProjectCode = asyncHandler(async (req, res) => {
  const code = await contributionService.getProjectCode(req.params.projectId, req.user);
  return sendSuccess(res, {
    message: 'Project code retrieved successfully',
    data: code
  });
});

/**
 * @desc    Get version history for a project
 * @route   GET /api/v1/projects/:projectId/versions
 * @access  Private (Project members / Manager)
 */
export const getVersionHistory = asyncHandler(async (req, res) => {
  const { versions, pagination } = await contributionService.getVersionHistory(
    req.params.projectId,
    req.user,
    req.query
  );
  return sendSuccess(res, {
    message: 'Version history retrieved successfully',
    data: versions,
    pagination
  });
});

/**
 * @desc    Get a specific version by version number
 * @route   GET /api/v1/projects/:projectId/versions/:version
 * @access  Private (Project members / Manager)
 */
export const getVersionByNumber = asyncHandler(async (req, res) => {
  const version = await contributionService.getVersionByNumber(
    req.params.projectId,
    req.params.version,
    req.user
  );
  return sendSuccess(res, {
    message: 'Version retrieved successfully',
    data: version
  });
});

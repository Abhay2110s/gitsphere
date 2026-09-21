import { asyncHandler } from '../utils/asyncHandler.js';
import * as codeService from '../services/code.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Create new code file in task
 * @route   POST /api/v1/tasks/:taskId/files
 * @access  Private (Assigned User or Manager)
 */
export const createFile = asyncHandler(async (req, res) => {
  const file = await codeService.createFile(req.params.taskId, req.user, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'File created successfully',
    data: file
  });
});

/**
 * @desc    Get all files in task
 * @route   GET /api/v1/tasks/:taskId/files
 * @access  Private (Authorized members / Manager)
 */
export const getFilesByTask = asyncHandler(async (req, res) => {
  const files = await codeService.getFilesByTask(req.params.taskId, req.user);
  return sendSuccess(res, {
    message: 'Files retrieved successfully',
    data: files
  });
});

/**
 * @desc    Get file details and content
 * @route   GET /api/v1/code/files/:fileId
 * @access  Private (Authorized members / Manager)
 */
export const getFileById = asyncHandler(async (req, res) => {
  const file = await codeService.getFileById(req.params.fileId, req.user);
  return sendSuccess(res, {
    message: 'File retrieved successfully',
    data: file
  });
});

/**
 * @desc    Update code file content
 * @route   PATCH /api/v1/code/files/:fileId
 * @access  Private (Assigned User)
 */
export const updateFile = asyncHandler(async (req, res) => {
  const file = await codeService.updateFile(req.params.fileId, req.user, req.body);
  return sendSuccess(res, {
    message: 'File updated successfully',
    data: file
  });
});

/**
 * @desc    Delete code file
 * @route   DELETE /api/v1/code/files/:fileId
 * @access  Private (Assigned User or Manager)
 */
export const deleteFile = asyncHandler(async (req, res) => {
  await codeService.deleteFile(req.params.fileId, req.user);
  return sendSuccess(res, {
    message: 'File deleted successfully'
  });
});

/**
 * @desc    Create a new version snapshot (Explicit save/commit)
 * @route   POST /api/v1/code/files/:fileId/versions
 * @access  Private (Assigned User)
 */
export const createVersion = asyncHandler(async (req, res) => {
  const { commitMessage } = req.body;
  const version = await codeService.createVersion(req.params.fileId, req.user, commitMessage);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Code version saved successfully',
    data: version
  });
});

/**
 * @desc    Get version history for file
 * @route   GET /api/v1/code/files/:fileId/versions
 * @access  Private (Authorized members / Manager)
 */
export const getVersions = asyncHandler(async (req, res) => {
  const { versions, pagination } = await codeService.getVersions(
    req.params.fileId,
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
 * @desc    Get specific historical version snapshot
 * @route   GET /api/v1/code/files/:fileId/versions/:versionId
 * @access  Private (Authorized members / Manager)
 */
export const getVersionById = asyncHandler(async (req, res) => {
  const version = await codeService.getVersionById(
    req.params.fileId,
    req.params.versionId,
    req.user
  );
  return sendSuccess(res, {
    message: 'Version snapshot retrieved successfully',
    data: version
  });
});

/**
 * @desc    Restore code file to previous version snapshot
 * @route   POST /api/v1/code/files/:fileId/restore/:versionId
 * @access  Private (Assigned User or Manager)
 */
export const restoreVersion = asyncHandler(async (req, res) => {
  const result = await codeService.restoreVersion(
    req.params.fileId,
    req.params.versionId,
    req.user
  );
  return sendSuccess(res, {
    message: 'File restored to selected version successfully',
    data: result
  });
});

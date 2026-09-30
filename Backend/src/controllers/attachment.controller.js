import { asyncHandler } from '../utils/asyncHandler.js';
import * as attachmentService from '../services/attachment.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Upload a file attachment
 * @route   POST /api/v1/attachments/upload
 * @access  Private
 */
export const uploadAttachment = asyncHandler(async (req, res) => {
  const attachment = await attachmentService.createAttachment({
    file: req.file,
    user: req.user,
    projectId: req.body.projectId,
    taskId: req.body.taskId
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'File uploaded successfully',
    data: attachment
  });
});

/**
 * @desc    Get attachments
 * @route   GET /api/v1/attachments
 * @access  Private
 */
export const getAttachments = asyncHandler(async (req, res) => {
  const attachments = await attachmentService.getAttachments(req.user, req.query);

  return sendSuccess(res, {
    message: 'Attachments retrieved successfully',
    data: attachments
  });
});

/**
 * @desc    Delete an attachment
 * @route   DELETE /api/v1/attachments/:id
 * @access  Private
 */
export const deleteAttachment = asyncHandler(async (req, res) => {
  const result = await attachmentService.deleteAttachment(req.params.id, req.user);

  return sendSuccess(res, {
    message: result.message
  });
});

/**
 * @desc    Get attachment details by ID
 * @route   GET /api/v1/attachments/:id
 * @access  Private
 */
export const getAttachmentById = asyncHandler(async (req, res) => {
  const attachment = await attachmentService.getAttachmentById(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Attachment details retrieved',
    data: attachment
  });
});

/**
 * @desc    Download / Stream attachment file with authorization
 * @route   GET /api/v1/attachments/:id/download
 * @access  Private
 */
export const downloadAttachment = asyncHandler(async (req, res) => {
  const { filePath, mimeType, originalName } = await attachmentService.getAttachmentFile(
    req.params.id,
    req.user
  );

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
  return res.sendFile(filePath);
});


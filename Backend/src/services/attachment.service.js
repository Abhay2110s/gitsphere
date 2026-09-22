import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import FileAttachment from '../models/FileAttachment.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/response.js';
import { hasProjectAccess } from '../middleware/projectAccess.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

/**
 * Save an uploaded file attachment record
 */
export const createAttachment = async ({ file, user, projectId = null, taskId = null }) => {
  if (!file) {
    throw new AppError('No file provided for upload', 400, 'NO_FILE_PROVIDED');
  }

  // If projectId is provided, verify user access
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError('Invalid Project ID format', 400, 'INVALID_ID');
    }
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (!hasProjectAccess(project, user)) {
      const message =
        user.role === 'MANAGER'
          ? 'Access denied to upload files to this project'
          : 'Access denied. You are not a member of this project';
      throw new AppError(message, 403, 'FORBIDDEN');
    }
  }

  // If taskId is provided, verify task exists
  if (taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }
  }

  const fileUrl = `/uploads/${file.filename}`;

  const attachment = await FileAttachment.create({
    originalName: file.originalname,
    url: fileUrl,
    storageKey: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: user._id,
    project: projectId || null,
    task: taskId || null
  });

  return attachment.populate([
    { path: 'uploadedBy', select: 'name email avatar' },
    { path: 'project', select: 'name' },
    { path: 'task', select: 'title' }
  ]);
};

/**
 * Get attachments with filtering and pagination
 */
export const getAttachments = async (user, queryParams = {}) => {
  const query = {};

  if (queryParams.projectId) {
    if (!mongoose.Types.ObjectId.isValid(queryParams.projectId)) {
      throw new AppError('Invalid Project ID format', 400, 'INVALID_ID');
    }
    query.project = queryParams.projectId;
  }

  if (queryParams.taskId) {
    if (!mongoose.Types.ObjectId.isValid(queryParams.taskId)) {
      throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
    }
    query.task = queryParams.taskId;
  }

  const attachments = await FileAttachment.find(query)
    .populate('uploadedBy', 'name email avatar')
    .populate('project', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 });

  return attachments;
};

/**
 * Delete an attachment
 */
export const deleteAttachment = async (attachmentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(attachmentId)) {
    throw new AppError('Invalid Attachment ID format', 400, 'INVALID_ID');
  }

  const attachment = await FileAttachment.findById(attachmentId).populate('project');
  if (!attachment) {
    throw new AppError('Attachment not found', 404, 'NOT_FOUND');
  }

  const isUploader = attachment.uploadedBy.equals(user._id);
  const isProjectManager =
    attachment.project && user.role === 'MANAGER' && attachment.project.createdBy.equals(user._id);

  if (!isUploader && !isProjectManager) {
    throw new AppError('Permission denied to delete this attachment', 403, 'FORBIDDEN');
  }

  // Delete local file if it exists on disk
  try {
    const filePath = path.join(uploadsDir, attachment.storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting local file from disk:', err.message);
  }

  await FileAttachment.findByIdAndDelete(attachmentId);
  return { message: 'Attachment deleted successfully' };
};

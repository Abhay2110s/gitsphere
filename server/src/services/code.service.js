import mongoose from 'mongoose';
import CodeFile from '../models/CodeFile.js';
import CodeVersion from '../models/CodeVersion.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/response.js';

/**
 * Helper to verify task and project access permissions
 */
const verifyTaskAccess = async (taskId, user, requireWrite = false) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  const project = task.project;

  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied to tasks outside your projects.', 403, 'FORBIDDEN');
    }
  } else {
    // Regular User
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }

    // Rule 6: Users can edit only their own assigned task code
    if (requireWrite) {
      if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
        throw new AppError('Permission denied. You can only create or edit code in your assigned tasks.', 403, 'FORBIDDEN');
      }
    }
  }

  return { task, project };
};

/**
 * Helper to verify file access and return populated file
 */
const verifyFileAccess = async (fileId, user, requireWrite = false) => {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new AppError('Invalid File ID format', 400, 'INVALID_ID');
  }

  const file = await CodeFile.findById(fileId).populate({
    path: 'task',
    populate: { path: 'project' }
  });

  if (!file) {
    throw new AppError('File not found', 404, 'NOT_FOUND');
  }

  const task = file.task;
  const project = task.project;

  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied to files outside your projects.', 403, 'FORBIDDEN');
    }
  } else {
    // User role
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }

    // Rule 6: Users can edit only their own assigned task code
    if (requireWrite) {
      if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
        throw new AppError('Permission denied. You can only edit code in tasks assigned to you.', 403, 'FORBIDDEN');
      }
    }
  }

  return { file, task, project };
};

/**
 * Create a new code file within a task
 */
export const createFile = async (taskId, user, fileData) => {
  const { task, project } = await verifyTaskAccess(taskId, user, true);

  const filePath = fileData.filePath || '/';
  const fileName = fileData.fileName.trim();

  // Check unique filename in the same directory of this task
  const existingFile = await CodeFile.findOne({
    task: taskId,
    filePath,
    fileName
  });

  if (existingFile) {
    throw new AppError(
      `A file named "${fileName}" already exists in path "${filePath}" for this task.`,
      409,
      'DUPLICATE_FILE'
    );
  }

  const codeFile = await CodeFile.create({
    project: project._id,
    task: task._id,
    fileName,
    filePath,
    language: fileData.language || 'javascript',
    content: fileData.content || '// Start coding here...\n',
    createdBy: user._id,
    lastModifiedBy: user._id,
    version: 1
  });

  // Create initial Version 1 snapshot
  await CodeVersion.create({
    file: codeFile._id,
    versionNumber: 1,
    content: codeFile.content,
    changedBy: user._id,
    commitMessage: 'Initial file creation'
  });

  return codeFile;
};

/**
 * Get all files in a task (for file explorer tree)
 */
export const getFilesByTask = async (taskId, user) => {
  await verifyTaskAccess(taskId, user, false);

  const files = await CodeFile.find({ task: taskId })
    .populate('createdBy', 'name email avatar')
    .populate('lastModifiedBy', 'name email avatar')
    .sort({ filePath: 1, fileName: 1 });

  return files;
};

/**
 * Get single file content and metadata
 */
export const getFileById = async (fileId, user) => {
  const { file } = await verifyFileAccess(fileId, user, false);
  return file;
};

/**
 * Update file content or filename
 */
export const updateFile = async (fileId, user, updateData) => {
  const { file } = await verifyFileAccess(fileId, user, true);

  if (updateData.content !== undefined) {
    file.content = updateData.content;
  }
  if (updateData.fileName) {
    file.fileName = updateData.fileName.trim();
  }
  if (updateData.language) {
    file.language = updateData.language.toLowerCase().trim();
  }

  file.lastModifiedBy = user._id;
  await file.save();

  return file;
};

/**
 * Delete a code file and all its historical versions
 */
export const deleteFile = async (fileId, user) => {
  const { file } = await verifyFileAccess(fileId, user, true);

  await Promise.all([
    CodeFile.findByIdAndDelete(file._id),
    CodeVersion.deleteMany({ file: file._id })
  ]);

  return { message: 'File deleted successfully' };
};

/**
 * Create a new version snapshot (Explicit save/commit)
 * Rule 14 & 15: Preserves previous versions; not called on every keystroke.
 */
export const createVersion = async (fileId, user, commitMessage) => {
  const { file } = await verifyFileAccess(fileId, user, true);

  const nextVersionNumber = file.version + 1;

  const version = await CodeVersion.create({
    file: file._id,
    versionNumber: nextVersionNumber,
    content: file.content,
    changedBy: user._id,
    commitMessage: commitMessage || `Saved version ${nextVersionNumber}`
  });

  // Update file's current version counter
  file.version = nextVersionNumber;
  file.lastModifiedBy = user._id;
  await file.save();

  return version.populate('changedBy', 'name email avatar');
};

/**
 * Get version history for a file
 */
export const getVersions = async (fileId, user, queryParams = {}) => {
  await verifyFileAccess(fileId, user, false);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [versions, total] = await Promise.all([
    CodeVersion.find({ file: fileId })
      .populate('changedBy', 'name email avatar')
      .sort({ versionNumber: -1 })
      .skip(skip)
      .limit(limit),
    CodeVersion.countDocuments({ file: fileId })
  ]);

  return {
    versions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get specific version snapshot details
 */
export const getVersionById = async (fileId, versionId, user) => {
  await verifyFileAccess(fileId, user, false);

  if (!mongoose.Types.ObjectId.isValid(versionId)) {
    throw new AppError('Invalid Version ID format', 400, 'INVALID_ID');
  }

  const version = await CodeVersion.findOne({ _id: versionId, file: fileId }).populate(
    'changedBy',
    'name email avatar'
  );

  if (!version) {
    throw new AppError('Code version not found', 404, 'NOT_FOUND');
  }

  return version;
};

/**
 * Restore code file to a previous version snapshot
 */
export const restoreVersion = async (fileId, versionId, user) => {
  const { file } = await verifyFileAccess(fileId, user, true);

  if (!mongoose.Types.ObjectId.isValid(versionId)) {
    throw new AppError('Invalid Version ID format', 400, 'INVALID_ID');
  }

  const targetVersion = await CodeVersion.findOne({ _id: versionId, file: fileId });
  if (!targetVersion) {
    throw new AppError('Code version to restore not found', 404, 'NOT_FOUND');
  }

  const nextVersionNumber = file.version + 1;

  // Restore file content to snapshot
  file.content = targetVersion.content;
  file.version = nextVersionNumber;
  file.lastModifiedBy = user._id;
  await file.save();

  // Create an explicit version entry for the restore action
  const restoreRecord = await CodeVersion.create({
    file: file._id,
    versionNumber: nextVersionNumber,
    content: targetVersion.content,
    changedBy: user._id,
    commitMessage: `Restored from version ${targetVersion.versionNumber}`
  });

  return {
    file,
    restoredVersion: restoreRecord
  };
};

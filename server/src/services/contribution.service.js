import mongoose from 'mongoose';
import Contribution from '../models/Contribution.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { AppError } from '../utils/response.js';
import { logActivity } from './activity.service.js';
import { createNotification } from './notification.service.js';
import { getIO } from '../sockets/socket.js';

// ============================================================
// Helper: Verify project access for the current user
// ============================================================
const verifyProjectMembership = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Invalid Project ID format', 400, 'INVALID_ID');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied. You can only access projects you created.', 403, 'FORBIDDEN');
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }
  }

  return project;
};

// ============================================================
// Helper: Emit Socket.IO event safely
// ============================================================
const emitToProject = (projectId, event, data) => {
  try {
    const io = getIO();
    io.to(`project:${projectId}`).emit(event, data);
  } catch {
    // Socket.IO may not be initialized during tests or seeding
  }
};

// ============================================================
// 1. Create / Submit Contribution
// ============================================================

/**
 * Developer creates a contribution (code submission) for a project task.
 * Auto-assigns the next version number per project.
 * Sets status to IN_REVIEW and emits code:submitted event.
 */
export const createContribution = async (user, data) => {
  const { projectId, taskId, files } = data;

  // Verify user is a developer (USER role)
  if (user.role !== 'USER') {
    throw new AppError('Only developers (USER role) can submit contributions.', 403, 'FORBIDDEN');
  }

  // Verify project access
  const project = await verifyProjectMembership(projectId, user);

  // Verify task exists and belongs to this project
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid Task ID format', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  if (!task.project.equals(project._id)) {
    throw new AppError('This task does not belong to the specified project.', 400, 'TASK_PROJECT_MISMATCH');
  }

  // Verify developer is assigned to this task
  if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
    throw new AppError(
      'Permission denied. You can only submit contributions for tasks assigned to you.',
      403,
      'FORBIDDEN'
    );
  }

  // Calculate next version number for this project
  const latestContribution = await Contribution.findOne({ project: projectId })
    .sort({ version: -1 })
    .select('version');

  const nextVersion = latestContribution ? latestContribution.version + 1 : 1;

  // Create the contribution
  const contribution = await Contribution.create({
    project: projectId,
    task: taskId,
    developer: user._id,
    version: nextVersion,
    files: files.map((f) => ({
      path: f.path.trim(),
      content: f.content,
      language: f.language || 'javascript'
    })),
    status: 'IN_REVIEW',
    submittedAt: new Date()
  });

  // Update task status to IN_REVIEW
  if (task.status !== 'IN_REVIEW') {
    task.status = 'IN_REVIEW';
    await task.save();
  }

  // Populate for response
  const populated = await contribution.populate([
    { path: 'developer', select: 'name email avatar role' },
    { path: 'task', select: 'title status priority' },
    { path: 'project', select: 'name' }
  ]);

  // Emit Socket.IO event
  emitToProject(projectId, 'code:submitted', {
    contributionId: contribution._id,
    projectId,
    taskId,
    developerId: user._id,
    developerName: user.name,
    version: contribution.version,
    taskTitle: task.title
  });

  // Notify the project manager
  const managerId = project.createdBy._id || project.createdBy;
  createNotification({
    user: managerId,
    type: 'CODE_SUBMITTED',
    title: 'New Code Submission',
    message: `${user.name} submitted Version ${nextVersion} for task "${task.title}" in project "${project.name}".`,
    project: project._id,
    task: task._id,
    relatedUser: user._id
  }).catch(() => {});

  // Log activity
  logActivity({
    user: user._id,
    project: project._id,
    task: task._id,
    action: 'CONTRIBUTION_SUBMITTED',
    metadata: {
      version: nextVersion,
      fileCount: files.length,
      taskTitle: task.title
    }
  });

  return populated;
};

// ============================================================
// 2. Approve Contribution
// ============================================================

/**
 * Manager approves a contribution.
 * - Updates contribution status to APPROVED
 * - Copies files into Project.currentFiles
 * - Bumps Project.currentVersion
 * - Optionally updates task to COMPLETED
 * - Creates activity log
 * - Notifies all project developers
 * - Emits code:approved via Socket.IO
 */
export const approveContribution = async (contributionId, manager) => {
  if (!mongoose.Types.ObjectId.isValid(contributionId)) {
    throw new AppError('Invalid Contribution ID format', 400, 'INVALID_ID');
  }

  // Step 1: Find contribution
  const contribution = await Contribution.findById(contributionId);
  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }

  // Step 2: Verify status is IN_REVIEW
  if (contribution.status !== 'IN_REVIEW') {
    throw new AppError(
      `Cannot approve a contribution with status "${contribution.status}". Only IN_REVIEW contributions can be approved.`,
      400,
      'INVALID_STATUS'
    );
  }

  // Step 3: Verify manager owns the project
  const project = await Project.findById(contribution.project);
  if (!project) {
    throw new AppError('Associated project not found', 404, 'NOT_FOUND');
  }

  if (!project.createdBy.equals(manager._id)) {
    throw new AppError(
      'Access denied. You can only approve contributions in projects you created.',
      403,
      'FORBIDDEN'
    );
  }

  // Step 3b: Cannot approve own contribution
  if (contribution.developer.equals(manager._id)) {
    throw new AppError('You cannot approve your own contribution.', 403, 'FORBIDDEN');
  }

  // Step 4: Mark contribution as APPROVED
  contribution.status = 'APPROVED';
  contribution.reviewedBy = manager._id;
  contribution.reviewedAt = new Date();

  // Step 5: Update Project — merge approved files and bump version
  // Existing files are preserved; files in the contribution are updated or added.
  const fileMap = new Map();
  if (Array.isArray(project.currentFiles)) {
    for (const f of project.currentFiles) {
      fileMap.set(f.path, {
        path: f.path,
        content: f.content,
        language: f.language || 'javascript'
      });
    }
  }

  for (const f of contribution.files) {
    fileMap.set(f.path, {
      path: f.path,
      content: f.content,
      language: f.language || 'javascript'
    });
  }

  project.currentFiles = Array.from(fileMap.values());
  project.currentVersion = contribution.version;
  await project.save();

  // Step 5b: Store immutable snapshot of the entire project code at this version
  contribution.projectSnapshot = project.currentFiles.map((f) => ({
    path: f.path,
    content: f.content,
    language: f.language
  }));
  await contribution.save();

  // Step 6: Update task status if appropriate
  const task = await Task.findById(contribution.task);
  if (task && task.status === 'IN_REVIEW') {
    task.status = 'COMPLETED';
    await task.save();
  }

  // Step 7: Create activity log
  logActivity({
    user: manager._id,
    project: project._id,
    task: contribution.task,
    action: 'CONTRIBUTION_APPROVED',
    metadata: {
      version: contribution.version,
      contributionId: contribution._id,
      taskTitle: task ? task.title : 'Unknown'
    }
  });

  // Step 8: Notify all project developers
  for (const memberId of project.members) {
    createNotification({
      user: memberId,
      type: 'CODE_APPROVED',
      title: 'New Approved Code Available',
      message: `Version ${contribution.version} has been approved by ${manager.name} for project "${project.name}".`,
      project: project._id,
      task: contribution.task,
      relatedUser: manager._id
    }).catch(() => {});
  }

  // Step 9: Emit Socket.IO event for real-time synchronization
  emitToProject(project._id.toString(), 'code:approved', {
    projectId: project._id,
    contributionId: contribution._id,
    version: contribution.version,
    files: project.currentFiles, // Complete merged project codebase
    changedFiles: contribution.files, // Specific files modified in this contribution
    approvedBy: {
      id: manager._id,
      name: manager.name
    },
    approvedAt: contribution.reviewedAt
  });

  // Return populated contribution
  const populated = await contribution.populate([
    { path: 'developer', select: 'name email avatar role' },
    { path: 'reviewedBy', select: 'name email avatar role' },
    { path: 'task', select: 'title status priority' },
    { path: 'project', select: 'name currentVersion' }
  ]);

  return populated;
};

// ============================================================
// 3. Request Changes
// ============================================================

/**
 * Manager requests changes on a contribution.
 * Sets status to CHANGES_REQUESTED, stores review comment.
 * Emits code:changes-requested via Socket.IO.
 */
export const requestChanges = async (contributionId, manager, comment) => {
  if (!mongoose.Types.ObjectId.isValid(contributionId)) {
    throw new AppError('Invalid Contribution ID format', 400, 'INVALID_ID');
  }

  const contribution = await Contribution.findById(contributionId);
  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }

  // Verify status
  if (contribution.status !== 'IN_REVIEW') {
    throw new AppError(
      `Cannot request changes on a contribution with status "${contribution.status}". Only IN_REVIEW contributions can be reviewed.`,
      400,
      'INVALID_STATUS'
    );
  }

  // Verify manager owns the project
  const project = await Project.findById(contribution.project);
  if (!project) {
    throw new AppError('Associated project not found', 404, 'NOT_FOUND');
  }

  if (!project.createdBy.equals(manager._id)) {
    throw new AppError(
      'Access denied. You can only review contributions in projects you created.',
      403,
      'FORBIDDEN'
    );
  }

  // Cannot review own contribution
  if (contribution.developer.equals(manager._id)) {
    throw new AppError('You cannot review your own contribution.', 403, 'FORBIDDEN');
  }

  // Update contribution
  contribution.status = 'CHANGES_REQUESTED';
  contribution.reviewedBy = manager._id;
  contribution.reviewedAt = new Date();
  contribution.reviewComment = comment;
  await contribution.save();

  // Update task status
  const task = await Task.findById(contribution.task);
  if (task && task.status === 'IN_REVIEW') {
    task.status = 'CHANGES_REQUESTED';
    await task.save();
  }

  // Emit Socket.IO event
  emitToProject(project._id.toString(), 'code:changes-requested', {
    contributionId: contribution._id,
    taskId: contribution.task,
    developerId: contribution.developer,
    comment,
    reviewedBy: {
      id: manager._id,
      name: manager.name
    }
  });

  // Notify the developer
  createNotification({
    user: contribution.developer,
    type: 'CHANGES_REQUESTED_NOTIFICATION',
    title: 'Changes Requested',
    message: `${manager.name} requested changes on your Version ${contribution.version} submission: "${comment}"`,
    project: project._id,
    task: contribution.task,
    relatedUser: manager._id
  }).catch(() => {});

  // Log activity
  logActivity({
    user: manager._id,
    project: project._id,
    task: contribution.task,
    action: 'CHANGES_REQUESTED',
    metadata: {
      version: contribution.version,
      comment,
      contributionId: contribution._id
    }
  });

  const populated = await contribution.populate([
    { path: 'developer', select: 'name email avatar role' },
    { path: 'reviewedBy', select: 'name email avatar role' },
    { path: 'task', select: 'title status priority' },
    { path: 'project', select: 'name' }
  ]);

  return populated;
};

// ============================================================
// 4. Get Contributions by Project
// ============================================================

/**
 * List contributions for a project with pagination and optional status filter.
 */
export const getContributionsByProject = async (projectId, user, queryParams = {}) => {
  const project = await verifyProjectMembership(projectId, user);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { project: projectId };

  // Optional status filter
  if (queryParams.status) {
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'];
    if (validStatuses.includes(queryParams.status)) {
      query.status = queryParams.status;
    }
  }

  // Optional task filter
  if (queryParams.taskId && mongoose.Types.ObjectId.isValid(queryParams.taskId)) {
    query.task = queryParams.taskId;
  }

  const [contributions, total] = await Promise.all([
    Contribution.find(query)
      .populate('developer', 'name email avatar role')
      .populate('reviewedBy', 'name email avatar role')
      .populate('task', 'title status priority')
      .sort({ version: -1 })
      .skip(skip)
      .limit(limit),
    Contribution.countDocuments(query)
  ]);

  return {
    contributions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ============================================================
// 5. Get Single Contribution by ID
// ============================================================

export const getContributionById = async (contributionId, user) => {
  if (!mongoose.Types.ObjectId.isValid(contributionId)) {
    throw new AppError('Invalid Contribution ID format', 400, 'INVALID_ID');
  }

  const contribution = await Contribution.findById(contributionId)
    .populate('developer', 'name email avatar role')
    .populate('reviewedBy', 'name email avatar role')
    .populate('task', 'title status priority')
    .populate({
      path: 'project',
      select: 'name createdBy members currentVersion'
    });

  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }

  const project = contribution.project;

  // Verify access
  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      throw new AppError('Access denied to contributions outside your projects.', 403, 'FORBIDDEN');
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      throw new AppError('Access denied. You are not a member of this project.', 403, 'FORBIDDEN');
    }
  }

  return contribution;
};

// ============================================================
// 6. Get Latest Project Code
// ============================================================

/**
 * Returns the project's current approved code state.
 * GET /api/v1/projects/:projectId/code
 */
export const getProjectCode = async (projectId, user) => {
  const project = await verifyProjectMembership(projectId, user);

  // Find who last approved (the latest approved contribution)
  let updatedBy = null;
  if (project.currentVersion > 0) {
    const latestApproved = await Contribution.findOne({
      project: projectId,
      version: project.currentVersion,
      status: 'APPROVED'
    }).populate('reviewedBy', 'name email avatar');

    if (latestApproved && latestApproved.reviewedBy) {
      updatedBy = {
        id: latestApproved.reviewedBy._id,
        name: latestApproved.reviewedBy.name
      };
    }
  }

  return {
    projectId: project._id,
    currentVersion: project.currentVersion,
    files: project.currentFiles,
    updatedAt: project.updatedAt,
    updatedBy
  };
};

// ============================================================
// 7. Get Version History
// ============================================================

/**
 * Returns all approved contributions as version history.
 * GET /api/v1/projects/:projectId/versions
 */
export const getVersionHistory = async (projectId, user, queryParams = {}) => {
  await verifyProjectMembership(projectId, user);

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { project: projectId, status: 'APPROVED' };

  const [versions, total] = await Promise.all([
    Contribution.find(query)
      .populate('developer', 'name email avatar role')
      .populate('reviewedBy', 'name email avatar role')
      .populate('task', 'title')
      .select('-files')
      .sort({ version: -1 })
      .skip(skip)
      .limit(limit),
    Contribution.countDocuments(query)
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

// ============================================================
// 8. Get Specific Version by Number
// ============================================================

/**
 * Returns a specific version's full data including files.
 * GET /api/v1/projects/:projectId/versions/:version
 */
export const getVersionByNumber = async (projectId, versionNumber, user) => {
  await verifyProjectMembership(projectId, user);

  const version = parseInt(versionNumber, 10);
  if (isNaN(version) || version < 1) {
    throw new AppError('Invalid version number', 400, 'INVALID_VERSION');
  }

  const contribution = await Contribution.findOne({
    project: projectId,
    version
  })
    .populate('developer', 'name email avatar role')
    .populate('reviewedBy', 'name email avatar role')
    .populate('task', 'title status priority');

  if (!contribution) {
    throw new AppError(`Version ${version} not found for this project`, 404, 'NOT_FOUND');
  }

  return contribution;
};

// ============================================================
// 9. Get Pending Reviews (Manager Dashboard)
// ============================================================

/**
 * Returns all IN_REVIEW contributions across all projects managed by this manager.
 */
export const getPendingReviews = async (manager) => {
  // Find all projects managed by this manager
  const managedProjects = await Project.find({ createdBy: manager._id }).select('_id name');
  const projectIds = managedProjects.map((p) => p._id);

  const contributions = await Contribution.find({
    project: { $in: projectIds },
    status: 'IN_REVIEW'
  })
    .populate('developer', 'name email avatar role')
    .populate('task', 'title status priority')
    .populate('project', 'name')
    .sort({ submittedAt: -1 });

  return contributions;
};

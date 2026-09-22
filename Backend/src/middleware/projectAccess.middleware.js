import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { AppError } from '../utils/response.js';

/**
 * Check whether a user has access to a project:
 * - If user is MANAGER: must be the creator of the project (createdBy).
 * - If user is USER: must be enrolled in project.members.
 * @param {Object} project - The project document or object
 * @param {Object} user - The user document or object
 * @returns {boolean}
 */
export const hasProjectAccess = (project, user) => {
  if (!project || !user) return false;
  const userId = user._id || user.id;
  if (user.role === 'MANAGER') {
    return project.createdBy?.equals
      ? project.createdBy.equals(userId)
      : String(project.createdBy) === String(userId);
  }
  return (project.members || []).some((m) =>
    m.equals ? m.equals(userId) : String(m) === String(userId)
  );
};

/**
 * Middleware to verify that the authenticated user has legitimate access to the project.
 * - If user is MANAGER: must be the creator of the project (createdBy).
 * - If user is USER: must be enrolled in project.members.
 * - Otherwise: returns 403 FORBIDDEN.
 */
export const verifyProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError('Invalid Project ID format', 400, 'INVALID_ID'));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404, 'NOT_FOUND'));
    }

    if (!hasProjectAccess(project, req.user)) {
      const errorMessage =
        req.user.role === 'MANAGER'
          ? 'Access denied. You can only access projects you created.'
          : 'Access denied. You are not a member of this project.';
      return next(new AppError(errorMessage, 403, 'FORBIDDEN'));
    }

    // Attach project document to request for downstream controllers
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

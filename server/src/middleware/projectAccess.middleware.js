import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { AppError } from '../utils/response.js';

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

    const userId = req.user._id;

    if (req.user.role === 'MANAGER') {
      // Manager must be the creator of this specific project
      if (!project.createdBy.equals(userId)) {
        return next(
          new AppError(
            'Access denied. You can only access projects you created.',
            403,
            'FORBIDDEN'
          )
        );
      }
    } else {
      // User must be in members array
      const isMember = project.members.some((memberId) => memberId.equals(userId));
      if (!isMember) {
        return next(
          new AppError(
            'Access denied. You are not a member of this project.',
            403,
            'FORBIDDEN'
          )
        );
      }
    }

    // Attach project document to request for downstream controllers
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

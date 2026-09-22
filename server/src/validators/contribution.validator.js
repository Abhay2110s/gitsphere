/**
 * Validate contribution creation request
 */
export const createContributionSchema = (req, res, next) => {
  const { projectId, taskId, files } = req.body;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required'
    });
  }

  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: 'Task ID is required'
    });
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one file is required. Files must be an array of { path, content, language }.'
    });
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.path || typeof file.path !== 'string' || !file.path.trim()) {
      return res.status(400).json({
        success: false,
        message: `File at index ${i} is missing a valid "path" field.`
      });
    }
    if (file.content === undefined || file.content === null) {
      return res.status(400).json({
        success: false,
        message: `File at index ${i} is missing the "content" field.`
      });
    }
  }

  next();
};

/**
 * Validate request-changes request
 */
export const requestChangesSchema = (req, res, next) => {
  const { comment } = req.body;

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({
      success: false,
      message: 'A review comment is required when requesting changes.'
    });
  }

  next();
};

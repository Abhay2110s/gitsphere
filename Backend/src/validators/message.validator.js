// Validate chat message
export const createMessageSchema = (req, res, next) => {
  const { content } = req.body || {};
  const project = req.body?.project || req.body?.projectId;
  const task = req.body?.task || req.body?.taskId;

  // Check required fields
  if (!content || !String(content).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message content cannot be empty'
    });
  }

  if (!project && !task) {
    return res.status(400).json({
      success: false,
      message: 'Project ID or Task ID is required'
    });
  }

  // Normalize project and task fields for downstream controller & service
  if (project) {
    req.body.project = project;
    req.body.projectId = project;
  }
  if (task) {
    req.body.task = task;
    req.body.taskId = task;
  }

  next();
};

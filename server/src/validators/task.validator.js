// Validate task creation
export const createTaskSchema = (req, res, next) => {
  const { title } = req.body;

  // Check required fields
  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Task title is required"
    });
  }

  next();
};

// Validate task update
export const updateTaskSchema = (req, res, next) => {
  const { title } = req.body;

  // Check required fields
  if (title !== undefined && (!title || !title.trim())) {
    return res.status(400).json({
      message: "Task title cannot be empty"
    });
  }

  next();
};

// Validate task assignment
export const assignTaskSchema = (req, res, next) => {
  next();
};

// Validate task status update
export const updateTaskStatusSchema = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED'];

  // Check required fields
  if (!status) {
    return res.status(400).json({
      message: "Status is required"
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  next();
};


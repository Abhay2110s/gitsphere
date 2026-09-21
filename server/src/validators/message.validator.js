// Validate chat message
export const createMessageSchema = (req, res, next) => {
  const { content, project } = req.body;

  // Check required fields
  if (!content || !content.trim()) {
    return res.status(400).json({
      message: "Message content cannot be empty"
    });
  }

  if (!project || !project.trim()) {
    return res.status(400).json({
      message: "Project ID is required"
    });
  }

  next();
};


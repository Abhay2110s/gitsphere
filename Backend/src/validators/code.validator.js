// Validate file creation
export const createFileSchema = (req, res, next) => {
  const { fileName } = req.body;

  // Check required fields
  if (!fileName || !fileName.trim()) {
    return res.status(400).json({
      message: "File name is required"
    });
  }

  next();
};

// Validate file update
export const updateFileSchema = (req, res, next) => {
  next();
};

// Validate version creation
export const createVersionSchema = (req, res, next) => {
  const { commitMessage } = req.body;

  // Check required fields
  if (!commitMessage || !commitMessage.trim()) {
    return res.status(400).json({
      message: "Commit message is required"
    });
  }

  next();
};


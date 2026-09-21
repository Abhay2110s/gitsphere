// Validate project creation
export const createProjectSchema = (req, res, next) => {
  const { name } = req.body;

  // Check required fields
  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Project name is required"
    });
  }

  next();
};

// Validate project update
export const updateProjectSchema = (req, res, next) => {
  const { name } = req.body;

  // Check required fields
  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({
      message: "Project name cannot be empty"
    });
  }

  next();
};

// Validate adding member
export const addMemberSchema = (req, res, next) => {
  const { userId } = req.body;

  // Check required fields
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required"
    });
  }

  next();
};


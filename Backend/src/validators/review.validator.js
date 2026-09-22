// Validate line comment creation
export const createCommentSchema = (req, res, next) => {
  const { lineNumber, content } = req.body;

  // Check required fields
  if (lineNumber === undefined || lineNumber === null) {
    return res.status(400).json({
      message: "Line number is required"
    });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({
      message: "Comment content is required"
    });
  }

  next();
};

// Validate comment update
export const updateCommentSchema = (req, res, next) => {
  const { content } = req.body;

  // Check required fields
  if (!content || !content.trim()) {
    return res.status(400).json({
      message: "Comment content is required"
    });
  }

  next();
};

// Validate review submission
export const submitReviewSchema = (req, res, next) => {
  next();
};

// Validate review evaluation
export const evaluateReviewSchema = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['APPROVED', 'CHANGES_REQUESTED'];

  // Check required fields
  if (!status) {
    return res.status(400).json({
      message: "Status is required (APPROVED or CHANGES_REQUESTED)"
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  next();
};


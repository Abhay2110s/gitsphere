// Validate file creation
export const createFileSchema = (req, res, next) => {
  let rawName = req.body.fileName || req.body.path || req.body.name;

  // Check required fields
  if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
    return res.status(400).json({
      success: false,
      message: 'File name is required'
    });
  }

  const normalized = rawName.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const lastSlashIndex = normalized.lastIndexOf('/');

  if (lastSlashIndex !== -1) {
    req.body.fileName = normalized.slice(lastSlashIndex + 1);
    if (!req.body.filePath || req.body.filePath === '/') {
      req.body.filePath = '/' + normalized.slice(0, lastSlashIndex);
    }
  } else {
    req.body.fileName = normalized;
    if (!req.body.filePath) {
      req.body.filePath = '/';
    }
  }

  if (!req.body.fileName) {
    return res.status(400).json({
      success: false,
      message: 'Valid file name is required'
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


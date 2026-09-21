// Validate user registration
export const registerSchema = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  // Password length check
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  next();
};

// Validate login
export const loginSchema = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  next();
};

// Validate profile update
export const updateProfileSchema = (req, res, next) => {
  const { name } = req.body;

  // Check required fields
  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({
      message: "Name cannot be empty"
    });
  }

  next();
};


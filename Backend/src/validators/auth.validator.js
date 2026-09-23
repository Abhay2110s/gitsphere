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

// Validate OTP verification
export const verifyOtpSchema = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and 6-digit verification code are required"
    });
  }

  if (String(otp).trim().length !== 6) {
    return res.status(400).json({
      message: "Verification code must be 6 digits"
    });
  }

  next();
};

// Validate OTP resend
export const resendOtpSchema = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email address is required"
    });
  }

  next();
};

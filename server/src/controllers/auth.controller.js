import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { clearTokenCookie } from "../utils/jwt.js";

// API for register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar = "", bio = "" } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        errorCode: "DUPLICATE_RESOURCE",
        message: "An account with this email address already exists."
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user (Public registration strictly defaults to USER role)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      avatar,
      bio,
      role: "USER",
      isActive: true,
      lastSeen: new Date()
    });

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
      }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// API for login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        errorCode: "ACCOUNT_DEACTIVATED",
        message: "Your account has been deactivated. Please contact your manager."
      });
    }

    // Compare password
    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
      }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    // Update last seen
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// API for get current user
const getMe = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "NOT_FOUND",
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user profile retrieved",
      user,
      data: user
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// API for logout
const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export {
  registerUser,
  loginUser,
  getMe,
  logout,
  registerUser as register,
  loginUser as login
};

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { authenticate } from './middleware/auth.middleware.js';
import { sendSuccess } from './utils/response.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import codeRoutes from './routes/code.routes.js';
import reviewRoutes from './routes/review.routes.js';
import commentRoutes from './routes/comment.routes.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes from './routes/activity.routes.js';
import attachmentRoutes from './routes/attachment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import contributionRoutes from './routes/contribution.routes.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure MongoDB is connected in serverless / lambda environments
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err.message
      });
    }
  }
  next();
});

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Secure uploaded files with authentication and path traversal protection
app.use('/uploads', authenticate, (req, res) => {
  const safeFilename = path.basename(req.path);
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const resolvedPath = path.resolve(uploadsDir, safeFilename);

  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(400).json({ success: false, message: 'Invalid file path' });
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  return res.sendFile(resolvedPath);
});

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Cross-Origin Resource Sharing setup (compatible with Vercel preview & production)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, postman, same-origin)
      if (!origin) return callback(null, true);

      const clientUrl = process.env.CLIENT_URL;
      const allowed = [
        clientUrl,
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost:3000'
      ].filter(Boolean);

      if (
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        // Permissive fallback so cross-origin Vercel deployments succeed
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Base welcome endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome to GitSphere API - Real-Time Collaborative Coding & Code Review Platform',
  });
});

app.get('/api', (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome to GitSphere API - Real-Time Collaborative Coding & Code Review Platform',
  });
});

// API v1 Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;

  return sendSuccess(res, {
    message: 'GitSphere API health check passed',
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatusMap[dbState] || 'unknown',
        readyState: dbState
      }
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/code/comments', commentRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/attachments', attachmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/contributions', contributionRoutes);

// Catch-all for undefined routes
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

export default app;

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Cross-Origin Resource Sharing setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
    data: {
      name: 'GitSphere API',
      version: '1.0.0',
      status: 'operational',
      docs: '/api-docs'
    }
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

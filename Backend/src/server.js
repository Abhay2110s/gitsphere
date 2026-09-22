import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socket.js';

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap and start GitSphere server
 */
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP Server & Attach Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 3. Start HTTP Listener
    const server = httpServer.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 GitSphere Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/v1/health`);
      console.log(`🔌 Socket.IO: Initialized & listening`);
      console.log(`=========================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection]', err.message);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('[Uncaught Exception]', err.message);
      process.exit(1);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (error) {
    console.error(`[Fatal Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();

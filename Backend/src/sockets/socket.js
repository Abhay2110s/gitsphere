import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { registerCodeHandlers } from './code.socket.js';
import { registerChatHandlers } from './chat.socket.js';
import { registerNotificationHandlers } from './notification.socket.js';

let ioInstance = null;

/**
 * Helper to parse cookie string from socket handshake headers
 */
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [name, ...rest] = pair.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(rest.join('='));
    }
  }
  return cookies;
};

/**
 * Initialize Socket.IO server attached to Node HTTP server
 */
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = null;

      // 1. Check handshake auth object
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }
      // 2. Check query parameter
      else if (socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
      }
      // 3. Check Cookie header
      else if (socket.handshake.headers && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      if (!token) {
        return next(new Error('Authentication required: No token provided'));
      }

      // Verify JWT
      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (err) {
        return next(new Error('Authentication failed: Invalid or expired token'));
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('Authentication failed: User account unavailable'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error(`Socket authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Socket ID: ${socket.id}, User: ${socket.user.name} (${socket.user.role})`);

    // Register modular socket handlers
    registerCodeHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);
  });

  ioInstance = io;
  return io;
};

/**
 * Retrieve global Socket.IO instance
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
};

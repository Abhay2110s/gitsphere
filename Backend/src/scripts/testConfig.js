import 'dotenv/config';

const PORT = process.env.PORT || 5000;

/**
 * Root server URL (e.g. http://localhost:5000)
 * Configurable via SERVER_URL or PORT environment variables.
 */
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

/**
 * REST API v1 Base URL (e.g. http://localhost:5000/api/v1)
 */
export const API_URL = `${SERVER_URL}/api/v1`;
export const BASE_URL = API_URL;

/**
 * WebSocket / Socket.IO server URL (alias to SERVER_URL)
 */
export const WS_URL = SERVER_URL;

export default {
  SERVER_URL,
  API_URL,
  BASE_URL,
  WS_URL
};

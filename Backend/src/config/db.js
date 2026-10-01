import mongoose from 'mongoose';

let cachedConnection = null;

/**
 * Connect to MongoDB database instance
 * Supports serverless connection reuse for Vercel deployment
 */
export const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, return the existing connection promise
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    console.error('[Database Error] MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is required.');
  }

  try {
    cachedConnection = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    const conn = await cachedConnection;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Only exit in standalone node process, not in serverless lambda
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Runtime error: ${err.message}`);
});

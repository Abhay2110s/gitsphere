import app from '../Backend/src/app.js';
import { connectDB } from '../Backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless Root] DB connection error:', error.message);
  }
  return app(req, res);
}

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-foodshare-jwt-key-2026-production-ready',
  JWT_EXPIRES_IN: '7d',
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(process.cwd(), 'foodshare.db'),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

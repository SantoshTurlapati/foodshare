import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (!fs.existsSync(ENV.UPLOAD_DIR)) {
    fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(ENV.UPLOAD_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'FoodShare API Server',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(errorHandler);

  return app;
}

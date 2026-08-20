import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { connectDB } from '../server/config/db.js';
import { seedInitialAdmin } from '../server/controllers/adminController.js';
import adminRoutes from '../server/routes/adminRoutes.js';
import animeRoutes from '../server/routes/animeRoutes.js';
import episodeRoutes from '../server/routes/episodeRoutes.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Connect Database & Seed Admin
connectDB().catch(() => {});
seedInitialAdmin().catch(() => {});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/episodes', episodeRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AnimeFlix API (Serverless)',
    timestamp: new Date().toISOString(),
  });
});

export default app;

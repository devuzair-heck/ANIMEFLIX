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
import videoRoutes from '../server/routes/videoRoutes.js';
import genreRoutes from '../server/routes/genreRoutes.js';

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

// Connect Database & Seed Admin safely in background
connectDB().catch(() => {});
seedInitialAdmin().catch(() => {});

// Mount Routes with both /api/ and root prefixes for seamless Vercel serverless routing
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/anime', animeRoutes);
app.use('/anime', animeRoutes);

app.use('/api/episodes', episodeRoutes);
app.use('/episodes', episodeRoutes);

app.use('/api/videos', videoRoutes);
app.use('/videos', videoRoutes);

app.use('/api/genres', genreRoutes);
app.use('/genres', genreRoutes);

app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AnimeFlix API is running',
    service: 'AnimeFlix API (Serverless)',
    timestamp: new Date().toISOString(),
  });
});

export default app;

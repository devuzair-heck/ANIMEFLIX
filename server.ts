import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db.js';
import { seedInitialAdmin } from './server/controllers/adminController.js';
import adminRoutes from './server/routes/adminRoutes.js';
import animeRoutes from './server/routes/animeRoutes.js';
import episodeRoutes from './server/routes/episodeRoutes.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security & Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline styles & scripts for Vite development
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

  // Connect Database & Bootstrap Initial Admin
  await connectDB();
  await seedInitialAdmin();

  // API Routes FIRST
  app.use('/api/admin', adminRoutes);
  app.use('/api/anime', animeRoutes);
  app.use('/api/episodes', episodeRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'AnimeFlix API',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite Middleware for Development vs Static Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AnimeFlix Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { router as caseRouter } from './server/routes/caseRoutes.ts';
import { playerSessionMiddleware } from './server/middleware/playerSession.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Cloud Run / Container production detection
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  app.use(
    cors({
      origin: true,
      credentials: true,
      exposedHeaders: ['X-Player-Session', 'x-player-session'],
    })
  );

  app.use(express.json({ limit: '50kb' }));
  app.use(cookieParser());

  // Root & Container Health Check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // Mount API endpoints
  app.use('/api', playerSessionMiddleware, caseRouter);

  // Error handling middleware for API
  app.use('/api', errorHandler);

  // Serve Frontend
  if (isProd && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Catch-all general error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Mystery Room server running on http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

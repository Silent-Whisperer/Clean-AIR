import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { airQualityRouter } from './routes/airQualityRoutes';
import { locationRouter } from './routes/locationRoutes';
import { agentRouter } from './routes/agentRoutes';
import { communityRouter } from './routes/communityRoutes';
import { securityRouter } from './routes/securityRoutes';

/**
 * ClearAir Hardened Express Application
 * @description Configures security middleware, rate limiting, modular API routes, and static serving
 */
export const app = express();
app.set('trust proxy', 1);

// Security Middlewares & Content Security Policy Hardening
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: config.isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https://www.openstreetmap.org'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Express Rate Limiter: 250 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { error: 'Too many requests from this client, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

/**
 * Health check endpoint
 * @route GET /api/health
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ClearAir API',
    scale: 'Indian NAQI (CPCB)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Modular API Routers
app.use('/api', airQualityRouter);
app.use('/api/location', locationRouter);
app.use('/api/agent', agentRouter);
app.use('/api/community', communityRouter);
app.use('/api/security', securityRouter);

/**
 * Production Static File Serving for Render / Monolithic Deployment
 * @description Serves built Vite frontend assets from dist/ directory when present
 */
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

/**
 * Centralized Hardened Error Handler
 * @description Prevents stack trace and sensitive error leakage in production
 */
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ClearAir Express Error]', err);
  const isProd = config.isProduction;
  const status =
    typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;
  const message = err instanceof Error ? err.message : 'Unknown error';

  res.status(status).json({
    error: 'An internal server error occurred.',
    message: isProd ? 'Internal processing failure.' : message,
  });
});

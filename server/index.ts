import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { EnvironmentalCoordinator } from './coordinator';
import {
  validateHouseholdProfileInput,
  validateChatQueryInput,
  validateUploadSecurity,
} from './middleware/security';
import { HouseholdProfile } from './types';
import { config } from './config';

export const app = express();

// Security Middlewares & Content Security Policy Hardening
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https://www.openstreetmap.org'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({ origin: true, credentials: true }));
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

/**
 * Live AQI endpoint
 * @route GET /api/air-quality
 */
app.get('/api/air-quality', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = (req.query.city as string) || 'Delhi';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const data = await EnvironmentalCoordinator.fetchAirQuality(city, lat, lon);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Verified CAAQMS Monitoring Stations Endpoint
 * @route GET /api/stations
 */
app.get('/api/stations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stations = await EnvironmentalCoordinator.fetchMonitoringStations();
    res.json(stations);
  } catch (err) {
    next(err);
  }
});

/**
 * Real Network IP Location Auto-Detection Endpoint
 * @route GET /api/location/auto-detect
 */
app.get('/api/location/auto-detect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawForwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof rawForwarded === 'string'
      ? rawForwarded.split(',')[0].trim()
      : req.socket.remoteAddress;

    const detected = await EnvironmentalCoordinator.detectLocation(clientIp);
    res.json(detected);
  } catch (err) {
    next(err);
  }
});

/**
 * Personalized Agent Intelligence endpoint
 * @route POST /api/agent/recommendations
 */
app.post(
  '/api/agent/recommendations',
  validateHouseholdProfileInput,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile: HouseholdProfile = req.body;
      const result = await EnvironmentalCoordinator.generateHouseholdRecommendations(profile);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Grounded Conversational AI Assistant endpoint
 * @route POST /api/agent/chat
 */
app.post(
  '/api/agent/chat',
  validateChatQueryInput,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, profile, airQuality } = req.body;
      const response = await EnvironmentalCoordinator.answerAssistantQuery(
        question,
        profile,
        airQuality
      );
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Community challenges endpoint
 * @route GET /api/community/challenges
 */
app.get('/api/community/challenges', (_req: Request, res: Response) => {
  const challenges = EnvironmentalCoordinator.getCommunityChallenges();
  res.json(challenges);
});

/**
 * Toggle challenge completion
 * @route POST /api/community/challenges/:id/toggle
 */
app.post('/api/community/challenges/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed } = req.body;
  const updated = EnvironmentalCoordinator.toggleCommunityChallenge(id, Boolean(completed));
  if (!updated) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }
  res.json(updated);
});

/**
 * Binary magic bytes validation endpoint for telemetry/sensor log uploads
 * @route POST /api/security/validate-upload
 */
app.post(
  '/api/security/validate-upload',
  validateUploadSecurity,
  (req: Request, res: Response) => {
    const validatedBuffer = req.body.validatedBuffer as Buffer;
    const fileName = req.body.fileName || 'sensor_upload.json';

    res.json({
      status: 'success',
      fileName,
      byteLength: validatedBuffer.length,
      message: 'Binary magic number validation passed. File is clean and safe for processing.',
    });
  }
);

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
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ClearAir Express Error]', err);
  const isProd = config.isProduction;

  res.status(err.status || 500).json({
    error: 'An internal server error occurred.',
    message: isProd ? 'Internal processing failure.' : err.message || 'Unknown error',
  });
});

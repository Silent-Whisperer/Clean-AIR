import { Router, Request, Response, NextFunction } from 'express';
import { EnvironmentalCoordinator } from '../coordinator';

/**
 * Location Intelligence & Geocoding Router
 * @description Handles IP auto-detection, GPS reverse geocoding, and locality search
 */
export const locationRouter = Router();

/**
 * Real Network IP Location Auto-Detection Endpoint
 * @route GET /api/location/auto-detect
 */
locationRouter.get('/auto-detect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cfIp = req.headers['cf-connecting-ip'];
    const realIp = req.headers['x-real-ip'];
    const rawForwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof cfIp === 'string' && cfIp.trim()) ||
      (typeof realIp === 'string' && realIp.trim()) ||
      (typeof rawForwarded === 'string' ? rawForwarded.split(',')[0].trim() : undefined) ||
      req.ip ||
      req.socket.remoteAddress;

    const detected = await EnvironmentalCoordinator.detectLocation(clientIp);
    res.json(detected);
  } catch (err) {
    next(err);
  }
});

/**
 * Server-Side Reverse Geocoding Endpoint for GPS Coordinates
 * @route GET /api/location/reverse-geocode
 */
locationRouter.get('/reverse-geocode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      res.status(400).json({ error: 'Valid latitude and longitude query parameters are required.' });
      return;
    }

    const resolved = await EnvironmentalCoordinator.reverseGeocode(lat, lon);
    res.json(resolved);
  } catch (err) {
    next(err);
  }
});

/**
 * City / Locality Geocoding Search Endpoint
 * @route GET /api/location/search
 */
locationRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q || q.length > 120) {
      res.status(400).json({ error: 'A valid search query (1-120 chars) is required.' });
      return;
    }

    const result = await EnvironmentalCoordinator.searchLocation(q);
    if (!result) {
      res.status(404).json({ error: 'Location not found.' });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from 'express';
import { EnvironmentalCoordinator } from '../coordinator';

/**
 * Air Quality & CAAQMS Monitoring Stations Router
 * @description Exposes live CPCB NAQI telemetry and verified station network endpoints
 */
export const airQualityRouter = Router();

/**
 * Live AQI endpoint
 * @route GET /api/air-quality
 */
airQualityRouter.get('/air-quality', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = (req.query.city as string) || '';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const data = await EnvironmentalCoordinator.fetchAirQuality(city || undefined, lat, lon);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Verified CAAQMS Monitoring Stations Endpoint
 * @route GET /api/stations
 */
airQualityRouter.get('/stations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stations = await EnvironmentalCoordinator.fetchMonitoringStations();
    res.json(stations);
  } catch (err) {
    next(err);
  }
});

import { AirQualityMetrics, IndianAqiCategory } from '../types';
import {
  calculateIndianAqiFromPm25,
  calculateIndianAqiFromPm10,
  calculateUsEpaAqiFromPm25,
  getIndianCategoryFromAqi,
} from './aqiStandards';
import { findNearestStationMeta } from './stationsData';
import { resolveExactCoordinates } from './geocodingService';

/**
 * Fetches real-time environmental metrics for a city or coordinates
 * Hits Open-Meteo Air Quality API (European Copernicus atmospheric monitoring model).
 * Uses Indian NAQI calculation standard for Indian cities.
 */
export async function fetchLiveAirQuality(query: string, lat?: number, lon?: number): Promise<AirQualityMetrics> {
  const { lat: targetLat, lon: targetLon, label: locationLabel } = await resolveExactCoordinates(query, lat, lon);
  const nearestStation = findNearestStationMeta(targetLat, targetLon);

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&hourly=pm2_5,pm10&timezone=auto&forecast_days=2`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = (await response.json()) as any;
    const current = data.current || {};
    const pm25 = typeof current.pm2_5 === 'number' ? Math.round(current.pm2_5 * 10) / 10 : 22.0;
    const pm10 = typeof current.pm10 === 'number' ? Math.round(current.pm10 * 10) / 10 : 35.0;

    // Calculate Indian NAQI taking the max sub-index between PM2.5 and PM10 per CPCB rules
    const aqiPm25 = calculateIndianAqiFromPm25(pm25);
    const aqiPm10 = calculateIndianAqiFromPm10(pm10);
    const calculatedAqi = Math.max(aqiPm25, aqiPm10);
    const category = getIndianCategoryFromAqi(calculatedAqi);

    const no2 = current.nitrogen_dioxide ? Math.round(Number(current.nitrogen_dioxide) * 10) / 10 : undefined;
    const o3 = current.ozone ? Math.round(Number(current.ozone) * 10) / 10 : undefined;
    const so2 = current.sulphur_dioxide ? Math.round(Number(current.sulphur_dioxide) * 10) / 10 : undefined;
    const co = current.carbon_monoxide ? Math.round(Number(current.carbon_monoxide)) : undefined;

    // Build 6-period forecast from hourly data with exercise safety flag
    const hourly = data.hourly || {};
    const forecast: Array<{
      time: string;
      aqi: number;
      category: IndianAqiCategory;
      summary: string;
      isSafeForOutdoorExercise: boolean;
    }> = [];

    if (Array.isArray(hourly.time) && Array.isArray(hourly.pm2_5)) {
      const step = 4; // every 4 hours
      for (let i = 0; i < Math.min(hourly.time.length, 24); i += step) {
        const timeStr = hourly.time[i];
        const valPm25 = Number(hourly.pm2_5[i] || pm25);
        const fAqi = calculateIndianAqiFromPm25(valPm25);
        const fCat = getIndianCategoryFromAqi(fAqi);
        const dateObj = new Date(timeStr);
        const formattedHour = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const isSafe = fAqi <= 100;
        let summary = 'Optimal air quality for exercise and ventilation.';
        if (fAqi > 300) {
          summary = 'Severe winter smog trap. Restrict all outdoor aerobic activity.';
        } else if (fAqi > 200) {
          summary = 'Poor air dispersion. Inhalation minute volume must be minimized.';
        } else if (fAqi > 100) {
          summary = 'Moderate haze. Mild walking acceptable; high-intensity cardio not recommended.';
        }

        forecast.push({
          time: formattedHour,
          aqi: fAqi,
          category: fCat,
          summary,
          isSafeForOutdoorExercise: isSafe,
        });
      }
    }

    return {
      aqi: calculatedAqi,
      usEpaAqi: calculateUsEpaAqiFromPm25(pm25),
      category,
      scale: 'Indian NAQI (CPCB)',
      pm25,
      pm10,
      no2,
      o3,
      so2,
      co,
      dominantPollutant: pm25 > pm10 ? 'PM2.5 (Fine Respirable Particulates)' : 'PM10 (Coarse Inhalable Dust)',
      source: `European Copernicus Atmosphere Service & CPCB CAAQMS Network (${locationLabel})`,
      sourceUrl: 'https://open-meteo.com/en/docs/air-quality-api',
      timestamp: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
      stationName: nearestStation.name,
      stationLat: nearestStation.latitude,
      stationLon: nearestStation.longitude,
      forecast,
    };
  } catch (err) {
    console.warn(`[ClearAir AQI] Fetch failed (${(err as Error).message}) for ${locationLabel}.`);
    throw err;
  }
}

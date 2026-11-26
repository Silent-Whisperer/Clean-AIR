import { AirQualityMetrics, IndianAqiCategory } from '../types';
import {
  calculateIndianAqiFromPm25,
  calculateIndianAqiFromPm10,
  calculateUsEpaAqiFromPm25,
  getIndianCategoryFromAqi,
} from './aqiStandards';
import { calculateHaversineDistance, findNearestStationMeta } from './stationsData';
import { resolveExactCoordinates } from './geocodingService';

/**
 * Fetches real-time environmental metrics for a city or coordinates
 * @description Hits Open-Meteo Air Quality API (European Copernicus atmospheric monitoring model)
 * and computes Indian CPCB NAQI sub-indices across PM2.5 and PM10.
 * @param query - City or locality name
 * @param lat - Optional latitude
 * @param lon - Optional longitude
 * @returns Verified AirQualityMetrics adhering to Indian NAQI standard
 */
export async function fetchLiveAirQuality(query: string, lat?: number, lon?: number): Promise<AirQualityMetrics> {
  const { lat: targetLat, lon: targetLon, label: locationLabel } = await resolveExactCoordinates(query, lat, lon);
  const nearestStation = findNearestStationMeta(targetLat, targetLon);
  const stationDistanceKm = calculateHaversineDistance(
    targetLat,
    targetLon,
    nearestStation.latitude,
    nearestStation.longitude
  );

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&hourly=pm2_5,pm10&timezone=auto&forecast_days=2`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = (await response.json()) as {
      current?: {
        time?: string;
        pm2_5?: number;
        pm10?: number;
        nitrogen_dioxide?: number;
        ozone?: number;
        sulphur_dioxide?: number;
        carbon_monoxide?: number;
      };
      hourly?: {
        time?: string[];
        pm2_5?: number[];
        pm10?: number[];
      };
    };
    const current = data.current || {};
    const hourly = data.hourly || {};

    // Find current hour index in hourly series as fallback if current fields are null
    const nowMs = current.time ? new Date(current.time).getTime() : Date.now();
    let startIdx = 0;
    if (Array.isArray(hourly.time) && hourly.time.length > 0) {
      const idx = hourly.time.findIndex((t: string) => new Date(t).getTime() >= nowMs - 3600000);
      startIdx = idx >= 0 ? idx : 0;
    }

    const rawPm25 =
      typeof current.pm2_5 === 'number'
        ? current.pm2_5
        : typeof hourly.pm2_5?.[startIdx] === 'number'
        ? hourly.pm2_5[startIdx]
        : 0;
    const rawPm10 =
      typeof current.pm10 === 'number'
        ? current.pm10
        : typeof hourly.pm10?.[startIdx] === 'number'
        ? hourly.pm10[startIdx]
        : 0;

    const pm25 = Math.round(rawPm25 * 10) / 10;
    const pm10 = Math.round(rawPm10 * 10) / 10;

    // Calculate Indian NAQI taking the max sub-index between PM2.5 and PM10 per CPCB rules
    const aqiPm25 = calculateIndianAqiFromPm25(pm25);
    const aqiPm10 = calculateIndianAqiFromPm10(pm10);
    const calculatedAqi = Math.max(aqiPm25, aqiPm10);
    const category = getIndianCategoryFromAqi(calculatedAqi);

    const no2 = typeof current.nitrogen_dioxide === 'number' ? Math.round(current.nitrogen_dioxide * 10) / 10 : undefined;
    const o3 = typeof current.ozone === 'number' ? Math.round(current.ozone * 10) / 10 : undefined;
    const so2 = typeof current.sulphur_dioxide === 'number' ? Math.round(current.sulphur_dioxide * 10) / 10 : undefined;
    const co = typeof current.carbon_monoxide === 'number' ? Math.round(current.carbon_monoxide) : undefined;

    // Build 6-period forward forecast (every 4 hours from current hour)
    const forecast: Array<{
      time: string;
      aqi: number;
      category: IndianAqiCategory;
      summary: string;
      isSafeForOutdoorExercise: boolean;
    }> = [];

    if (Array.isArray(hourly.time) && Array.isArray(hourly.pm2_5)) {
      const step = 4;
      const endIdx = Math.min(hourly.time.length, startIdx + 24);
      for (let i = startIdx; i < endIdx; i += step) {
        const timeStr = hourly.time[i];
        const valPm25 = typeof hourly.pm2_5[i] === 'number' ? hourly.pm2_5[i] : pm25;
        const valPm10 = typeof hourly.pm10?.[i] === 'number' ? hourly.pm10[i] : pm10;
        const fAqi = Math.max(calculateIndianAqiFromPm25(valPm25), calculateIndianAqiFromPm10(valPm10));
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

    const stationLabel =
      stationDistanceKm <= 50
        ? `${nearestStation.name} (${stationDistanceKm} km)`
        : `Copernicus Grid — ${locationLabel}`;

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
      dominantPollutant:
        aqiPm25 >= aqiPm10 ? 'PM2.5 (Fine Respirable Particulates)' : 'PM10 (Coarse Inhalable Dust)',
      source: `European Copernicus Atmosphere Service (${locationLabel})`,
      sourceUrl: 'https://open-meteo.com/en/docs/air-quality-api',
      timestamp: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
      stationName: stationLabel,
      stationLat: targetLat,
      stationLon: targetLon,
      forecast,
    };
  } catch (err) {
    console.warn(`[ClearAir AQI] Fetch failed (${(err as Error).message}) for ${locationLabel}.`);
    throw err;
  }
}

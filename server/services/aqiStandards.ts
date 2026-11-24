import { IndianAqiCategory } from '../types';

/**
 * Calculates US EPA Air Quality Index from PM2.5 (ug/m3)
 */
export function calculateUsEpaAqiFromPm25(pm25: number): number {
  if (pm25 <= 0) return 0;
  const c = Math.round(pm25 * 10) / 10;
  if (c <= 12.0) return Math.round((50 / 12.0) * c);
  if (c <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51);
  if (c <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101);
  if (c <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151);
  if (c <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201);
  if (c <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (c - 250.5) + 301);
  return Math.min(500, Math.round(((500 - 401) / (500.4 - 350.5)) * (c - 350.5) + 401));
}

/**
 * Calculates Indian National Air Quality Index (NAQI) according to CPCB guidelines.
 * Breakpoints for PM2.5 (24-hr avg in ug/m3):
 * 0 - 30    : Good (0 - 50)
 * 31 - 60   : Satisfactory (51 - 100)
 * 61 - 90   : Moderate (101 - 200)
 * 91 - 120  : Poor (201 - 300)
 * 121 - 250 : Very Poor (301 - 400)
 * 250+      : Severe (401 - 500)
 */
export function calculateIndianAqiFromPm25(pm25: number): number {
  if (pm25 <= 0) return 0;
  const c = Math.round(pm25 * 10) / 10;

  if (c <= 30) {
    return Math.round(((50 - 0) / (30 - 0)) * (c - 0) + 0);
  }
  if (c <= 60) {
    return Math.round(((100 - 51) / (60 - 31)) * (c - 31) + 51);
  }
  if (c <= 90) {
    return Math.round(((200 - 101) / (90 - 61)) * (c - 61) + 101);
  }
  if (c <= 120) {
    return Math.round(((300 - 201) / (120 - 91)) * (c - 91) + 201);
  }
  if (c <= 250) {
    return Math.round(((400 - 301) / (250 - 121)) * (c - 121) + 301);
  }
  // Severe / Hazardous extended
  return Math.min(500, Math.round(((500 - 401) / (380 - 250)) * (c - 250) + 401));
}

/**
 * Calculates Indian NAQI from PM10 (24-hr avg in ug/m3):
 * 0 - 50    : Good (0 - 50)
 * 51 - 100  : Satisfactory (51 - 100)
 * 101 - 250 : Moderate (101 - 200)
 * 251 - 350 : Poor (201 - 300)
 * 351 - 430 : Very Poor (301 - 400)
 * 430+      : Severe (401 - 500)
 */
export function calculateIndianAqiFromPm10(pm10: number): number {
  if (pm10 <= 0) return 0;
  const c = Math.round(pm10);

  if (c <= 50) return Math.round((50 / 50) * c);
  if (c <= 100) return Math.round(((100 - 51) / (100 - 51)) * (c - 51) + 51);
  if (c <= 250) return Math.round(((200 - 101) / (250 - 101)) * (c - 101) + 101);
  if (c <= 350) return Math.round(((300 - 201) / (350 - 251)) * (c - 251) + 201);
  if (c <= 430) return Math.round(((400 - 301) / (430 - 351)) * (c - 351) + 301);
  return Math.min(500, Math.round(((500 - 401) / (550 - 430)) * (c - 430) + 401));
}

/**
 * Returns the official CPCB Indian AQI category description
 */
export function getIndianCategoryFromAqi(aqi: number): IndianAqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

/**
 * Human readable explanation of health implications per CPCB
 */
export function getHealthImpactStatement(category: IndianAqiCategory): string {
  switch (category) {
    case 'Good':
      return 'Minimal health impact. Atmospheric conditions are clean and safe for all outdoor activities.';
    case 'Satisfactory':
      return 'Minor breathing discomfort to highly sensitive people. Acceptable for general public.';
    case 'Moderate':
      return 'Breathing discomfort to people with lungs, asthma and heart diseases. Children and elderly should limit prolonged outdoor exertion.';
    case 'Poor':
      return 'Breathing discomfort to most people on prolonged exposure. Significant hazard for sensitive respiratory groups.';
    case 'Very Poor':
      return 'Respiratory illness on prolonged exposure. Pronounced effects on people with lung and heart diseases.';
    case 'Severe':
      return 'Affects healthy people and seriously impacts those with existing diseases. Outdoor physical activity should be avoided.';
  }
}

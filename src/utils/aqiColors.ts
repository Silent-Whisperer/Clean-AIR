/**
 * Shared Indian CPCB NAQI Color & Badge Utilities
 * @description Centralizes accessible badge, border, and semantic theme styles for CPCB NAQI thresholds
 */

export interface AqiCategoryTheme {
  pill: string;
  ring: string;
  beacon: string;
  text: string;
  bar: string;
  border: string;
}

const AQI_CATEGORY_THEMES: Record<string, AqiCategoryTheme> = {
  Good: {
    pill: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    ring: 'ring-emerald-400/30',
    beacon: 'bg-emerald-500 ring-emerald-500/20',
    text: 'text-emerald-900',
    bar: 'bg-emerald-600',
    border: 'border-l-emerald-600',
  },
  Satisfactory: {
    pill: 'bg-lime-50 text-lime-950 border-lime-300',
    ring: 'ring-lime-400/30',
    beacon: 'bg-lime-500 ring-lime-500/20',
    text: 'text-lime-900',
    bar: 'bg-lime-600',
    border: 'border-l-lime-600',
  },
  Moderate: {
    pill: 'bg-yellow-50 text-yellow-950 border-yellow-300',
    ring: 'ring-yellow-400/30',
    beacon: 'bg-yellow-500 ring-yellow-500/20',
    text: 'text-yellow-900',
    bar: 'bg-yellow-600',
    border: 'border-l-yellow-600',
  },
  Poor: {
    pill: 'bg-orange-50 text-orange-950 border-orange-300',
    ring: 'ring-orange-400/30',
    beacon: 'bg-orange-500 ring-orange-500/20',
    text: 'text-orange-900',
    bar: 'bg-orange-600',
    border: 'border-l-orange-600',
  },
  'Very Poor': {
    pill: 'bg-red-50 text-red-950 border-red-300',
    ring: 'ring-red-400/30',
    beacon: 'bg-red-600 ring-red-600/20',
    text: 'text-red-900',
    bar: 'bg-red-700',
    border: 'border-l-red-600',
  },
  Severe: {
    pill: 'bg-stone-900 text-rose-300 border-rose-900',
    ring: 'ring-rose-900/40',
    beacon: 'bg-rose-700 ring-rose-700/30',
    text: 'text-rose-700',
    bar: 'bg-rose-900',
    border: 'border-l-rose-800',
  },
};

/**
 * Returns accessible Tailwind badge classes for a given Indian NAQI score
 * @param aqi - Indian National Air Quality Index value (0-500+)
 * @returns Tailwind CSS class string for text, background, and border
 */
export function getAqiBadgeColor(aqi: number): string {
  if (aqi <= 50) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (aqi <= 100) return 'text-lime-800 bg-lime-50 border-lime-200';
  if (aqi <= 200) return 'text-yellow-800 bg-yellow-50 border-yellow-200';
  if (aqi <= 300) return 'text-orange-800 bg-orange-50 border-orange-200';
  if (aqi <= 400) return 'text-red-800 bg-red-50 border-red-200';
  return 'text-rose-950 bg-rose-100 border-rose-300';
}

/**
 * Returns semantic Tailwind theme tokens for an Indian CPCB NAQI category
 * @param category - CPCB category string (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
 * @returns Theme object containing pill, ring, beacon, text, bar, and border classes
 */
export function getAqiCategoryTheme(category: string): AqiCategoryTheme {
  return AQI_CATEGORY_THEMES[category] ?? AQI_CATEGORY_THEMES.Severe;
}

/**
 * Returns progress-bar color class for a PM10 concentration (ug/m3)
 * @param pm10 - Coarse particulate matter concentration in ug/m3
 * @returns Tailwind background color class
 */
export function getPm10BarColor(pm10: number): string {
  if (pm10 <= 50) return 'bg-emerald-600';
  if (pm10 <= 100) return 'bg-lime-600';
  if (pm10 <= 250) return 'bg-yellow-600';
  if (pm10 <= 350) return 'bg-orange-600';
  if (pm10 <= 430) return 'bg-red-700';
  return 'bg-rose-900';
}

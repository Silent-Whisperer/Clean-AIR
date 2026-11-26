/**
 * Shared Indian CPCB NAQI Color & Badge Utilities
 * @description Centralizes accessible badge and border styles for CPCB NAQI thresholds
 */

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

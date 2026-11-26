import { describe, it, expect } from 'vitest';
import {
  calculateIndianAqiFromPm25,
  calculateIndianAqiFromPm10,
  calculateUsEpaAqiFromPm25,
  getIndianCategoryFromAqi,
  getHealthImpactStatement,
} from '../services/aqiStandards';

describe('CPCB Indian NAQI & US EPA Standards', () => {
  it('computes PM2.5 Indian NAQI across all 6 CPCB breakpoints', () => {
    expect(calculateIndianAqiFromPm25(0)).toBe(0);
    expect(calculateIndianAqiFromPm25(30)).toBe(50);
    expect(calculateIndianAqiFromPm25(45)).toBeGreaterThanOrEqual(51);
    expect(calculateIndianAqiFromPm25(60)).toBe(100);
    expect(calculateIndianAqiFromPm25(90)).toBe(200);
    expect(calculateIndianAqiFromPm25(120)).toBe(300);
    expect(calculateIndianAqiFromPm25(250)).toBe(400);
    expect(calculateIndianAqiFromPm25(400)).toBe(500);
  });

  it('computes PM10 Indian NAQI across CPCB breakpoints', () => {
    expect(calculateIndianAqiFromPm10(0)).toBe(0);
    expect(calculateIndianAqiFromPm10(50)).toBe(50);
    expect(calculateIndianAqiFromPm10(100)).toBe(100);
    expect(calculateIndianAqiFromPm10(250)).toBe(200);
    expect(calculateIndianAqiFromPm10(350)).toBe(300);
    expect(calculateIndianAqiFromPm10(430)).toBe(400);
    expect(calculateIndianAqiFromPm10(600)).toBe(500);
  });

  it('maps Indian NAQI scores to official categories and health statements', () => {
    expect(getIndianCategoryFromAqi(35)).toBe('Good');
    expect(getIndianCategoryFromAqi(80)).toBe('Satisfactory');
    expect(getIndianCategoryFromAqi(150)).toBe('Moderate');
    expect(getIndianCategoryFromAqi(250)).toBe('Poor');
    expect(getIndianCategoryFromAqi(350)).toBe('Very Poor');
    expect(getIndianCategoryFromAqi(450)).toBe('Severe');

    expect(getHealthImpactStatement('Severe')).toContain('avoided');
    expect(getHealthImpactStatement('Good')).toContain('Minimal health impact');
  });

  it('computes US EPA AQI from PM2.5 and caps at 500', () => {
    expect(calculateUsEpaAqiFromPm25(0)).toBe(0);
    expect(calculateUsEpaAqiFromPm25(12)).toBe(50);
    expect(calculateUsEpaAqiFromPm25(600)).toBe(500);
  });
});

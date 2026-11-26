import { describe, it, expect } from 'vitest';
import { calculateSustainableComparison, calculateImpactMetrics } from '../services/impactEngine';
import { HouseholdProfile } from '../types';

const sampleProfile: HouseholdProfile = {
  id: 'impact-test',
  name: 'Impact Household',
  locations: [{ id: 'l1', label: 'Home', cityName: 'Kolkata', latitude: 22.5726, longitude: 88.3639 }],
  activeLocationId: 'l1',
  householdMembers: {
    hasElderly: false,
    hasInfantsOrChildren: false,
    hasAsthmaOrRespiratory: false,
    totalOccupants: 2,
  },
  commute: {
    mode: 'bicycle',
    roundTripKm: 20,
    canWorkRemotely: true,
    departureTime: '08:30',
    returnTime: '18:00',
  },
  homeFeatures: {
    hasAirPurifier: true,
    hasExhaustKitchenFan: true,
    buildingType: 'apartment',
    cookingFuel: 'induction_electric',
  },
  dailySchedule: {
    morningOutdoorTime: '08:00',
    eveningOutdoorTime: '18:00',
    hasOutdoorExerciseRoutine: false,
  },
  budgetSensitivity: 'moderate',
  isOnboarded: true,
};

describe('Impact Engine & Commute Trade-Off Calculations', () => {
  it('recommends work_from_home during severe smog when remote work is available', () => {
    const comp = calculateSustainableComparison(sampleProfile, 310);
    expect(comp.recommendedMode).toBe('work_from_home');
    expect(comp.primaryConsideration).toBe('Personal Respiratory Safety');
    expect(comp.options).toHaveLength(5);
  });

  it('computes accurate weekly CO2e savings and personal exposure mitigation score', () => {
    const impact = calculateImpactMetrics(sampleProfile, 260);
    // 20 km * 5 days = 100 km/wk -> petrol 17.0 kg - metro 2.2 kg = 14.8 kg CO2e saved
    expect(impact.potentialWeeklyEmissionSavingsKgCO2e).toBe(14.8);
    // 45 base + 25 purifier + 10 exhaust + 15 remote(>200 AQI) + 5 induction = 100
    expect(impact.personalExposureMitigationScore).toBe(100);
    expect(impact.calculationBreakdown.length).toBeGreaterThanOrEqual(4);
  });
});

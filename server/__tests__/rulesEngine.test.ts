import { describe, it, expect } from 'vitest';
import { DeterministicRulesEngine } from '../services/rulesEngine';
import { HouseholdProfile, AirQualityMetrics } from '../types';

const baseProfile: HouseholdProfile = {
  id: 'test-household',
  name: 'Test Household',
  locations: [
    {
      id: 'loc-1',
      label: 'Home',
      cityName: 'Delhi',
      latitude: 28.6469,
      longitude: 77.316,
    },
  ],
  activeLocationId: 'loc-1',
  householdMembers: {
    hasElderly: true,
    hasInfantsOrChildren: true,
    hasAsthmaOrRespiratory: true,
    totalOccupants: 4,
  },
  commute: {
    mode: 'bicycle',
    roundTripKm: 16,
    canWorkRemotely: false,
    departureTime: '08:30',
    returnTime: '18:30',
  },
  homeFeatures: {
    hasAirPurifier: false,
    hasExhaustKitchenFan: true,
    buildingType: 'apartment',
    cookingFuel: 'lpg_gas',
  },
  dailySchedule: {
    morningOutdoorTime: '07:30',
    eveningOutdoorTime: '18:30',
    hasOutdoorExerciseRoutine: true,
  },
  budgetSensitivity: 'low',
  isOnboarded: true,
};

const severeAqi: AirQualityMetrics = {
  aqi: 340,
  usEpaAqi: 290,
  category: 'Very Poor',
  scale: 'Indian NAQI (CPCB)',
  pm25: 175,
  pm10: 290,
  dominantPollutant: 'PM2.5',
  stationName: 'Anand Vihar CAAQMS',
  city: 'Delhi',
  locality: 'Anand Vihar',
  latitude: 28.6469,
  longitude: 77.316,
  source: 'CPCB',
  lastUpdated: '10:00 AM',
  healthImpactStatement: 'Respiratory illness on prolonged exposure.',
  forecast: [],
};

describe('Deterministic Pulmonology Rules Engine', () => {
  it('enforces Pulmonary Safety Override when AQI >= 200 and provides DIY purifier guidance', () => {
    const plan = DeterministicRulesEngine.generateFullPlan(baseProfile, severeAqi);

    expect(plan.isAiGenerated).toBe(false);
    expect(plan.top3Actions).toHaveLength(3);
    expect(plan.timeline).toHaveLength(3);
    expect(plan.sustainableTransport.primaryConsideration).toBe('Personal Respiratory Safety');
    expect(plan.sustainableTransport.recommendedMode).toBe('metro');
    expect(
      plan.indoorGuidance.some((g) =>
        g.practicalSteps.some((s) => s.toLowerCase().includes('corsi-rosenthal'))
      )
    ).toBe(true);
  });

  it('allows active green commuting when AQI is Good', () => {
    const goodAqi: AirQualityMetrics = {
      ...severeAqi,
      aqi: 40,
      category: 'Good',
      pm25: 18,
      pm10: 32,
    };

    const plan = DeterministicRulesEngine.generateFullPlan(baseProfile, goodAqi);
    expect(plan.sustainableTransport.primaryConsideration).toBe('Emissions Reduction');
    expect(plan.sustainableTransport.recommendedMode).toBe('bicycle');
  });
});

import { HouseholdProfile } from '../types';

const STORAGE_KEY = 'clearair_household_profile_v5';

export const DEFAULT_INITIAL_PROFILE: HouseholdProfile = {
  id: 'household-primary',
  name: 'My Household',
  locations: [
    {
      id: 'loc-initial',
      label: 'Custom',
      customName: 'Monitored Location',
      cityName: 'Kolkata',
      locality: 'Central Monitoring Zone',
      latitude: 22.5726,
      longitude: 88.3639,
    },
  ],
  activeLocationId: 'loc-initial',
  householdMembers: {
    hasElderly: true,
    hasInfantsOrChildren: true,
    hasAsthmaOrRespiratory: true,
    totalOccupants: 4,
  },
  commute: {
    mode: 'public_transit',
    roundTripKm: 18,
    canWorkRemotely: true,
    departureTime: '08:30',
    returnTime: '18:00',
  },
  homeFeatures: {
    hasAirPurifier: true,
    purifierCount: 1,
    hasExhaustKitchenFan: true,
    buildingType: 'apartment',
    cookingFuel: 'lpg_gas',
  },
  dailySchedule: {
    morningOutdoorTime: '07:30',
    eveningOutdoorTime: '18:30',
    hasOutdoorExerciseRoutine: true,
  },
  budgetSensitivity: 'moderate',
  isOnboarded: true,
};

/**
 * Loads the persisted household profile from localStorage or returns clean defaults
 * @returns Hydrated HouseholdProfile
 */
export function loadStoredProfile(): HouseholdProfile {
  try {
    localStorage.removeItem('clearair_household_profile_v4');
    localStorage.removeItem('clearair_household_profile_v3');
    localStorage.removeItem('clearair_household_profile_v2');
    localStorage.removeItem('clearair_household_profile');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.locations) && parsed.locations.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored household profile, using defaults:', err);
  }
  return DEFAULT_INITIAL_PROFILE;
}

/**
 * Persists the household profile to localStorage
 * @param profile - Current HouseholdProfile state
 */
export function saveStoredProfile(profile: HouseholdProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to persist profile:', err);
  }
}

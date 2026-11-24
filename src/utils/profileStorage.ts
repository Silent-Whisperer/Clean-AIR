import { HouseholdProfile } from '../types';

const STORAGE_KEY = 'clearair_household_profile_v4'; // Upgraded storage key to anchor default home to localized area

export const DEFAULT_INITIAL_PROFILE: HouseholdProfile = {
  id: 'household-primary',
  name: 'My Household',
  locations: [
    {
      id: 'loc-primary-home',
      label: 'Home',
      cityName: 'Kolkata',
      locality: 'Santoshpur, Jadavpur',
      latitude: 22.4960,
      longitude: 88.3822,
    },
    {
      id: 'loc-secondary-work',
      label: 'Work',
      cityName: 'Kolkata',
      locality: 'Salt Lake Sector V',
      latitude: 22.5867,
      longitude: 88.4170,
    },
  ],
  activeLocationId: 'loc-primary-home',
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

export function loadStoredProfile(): HouseholdProfile {
  try {
    // Purge old storage keys
    localStorage.removeItem('clearair_household_profile_v3');
    localStorage.removeItem('clearair_household_profile_v2');
    localStorage.removeItem('clearair_household_profile');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.locations) && parsed.locations.length > 0) {
        // Sanitize every saved location to remove any remaining legacy Anand Vihar locality if city is West Bengal / Kolkata
        for (const loc of parsed.locations) {
          if (
            (loc.cityName.toLowerCase().includes('bengal') || loc.cityName.toLowerCase().includes('kolkata')) &&
            loc.locality?.toLowerCase().includes('anand vihar')
          ) {
            loc.cityName = 'Kolkata';
            loc.locality = 'Central Kolkata';
            loc.latitude = 22.5643;
            loc.longitude = 88.3693;
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored household profile, using defaults:', err);
  }
  return DEFAULT_INITIAL_PROFILE;
}

export function saveStoredProfile(profile: HouseholdProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to persist profile:', err);
  }
}

import React, { useEffect } from 'react';
import { HouseholdProfile, SavedLocation } from '../types';

/**
 * Custom Hook: Auto-detects user municipal location via backend network IP resolution
 * @param profile - Current household profile
 * @param setProfile - State setter for household profile
 */
export function useAutoLocation(
  profile: HouseholdProfile,
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>
): void {
  useEffect(() => {
    const hasDetectedGps = profile.locations.some((l) => l.isCurrentGps);
    if (!hasDetectedGps) {
      fetch('/api/location/auto-detect')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.city && data.latitude && data.longitude) {
            const detectedLoc: SavedLocation = {
              id: `auto-${Date.now()}`,
              label: 'Home',
              customName: 'Current Location',
              cityName: data.city,
              locality: data.region || undefined,
              latitude: data.latitude,
              longitude: data.longitude,
              isCurrentGps: true,
            };
            setProfile((prev) => ({
              ...prev,
              locations: [detectedLoc, ...prev.locations.filter((l) => l.cityName !== detectedLoc.cityName)],
              activeLocationId: detectedLoc.id,
            }));
          }
        })
        .catch((err) => {
          console.warn('Network location auto-detection failed:', err);
        });
    }
  }, []);
}

import React, { useEffect } from 'react';
import { HouseholdProfile, SavedLocation } from '../types';

/**
 * Custom Hook: Auto-detects user location on startup via browser GPS (if permitted) or backend IP resolution
 * @param profile - Current household profile
 * @param setProfile - State setter for household profile
 */
export function useAutoLocation(
  profile: HouseholdProfile,
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>
): void {
  useEffect(() => {
    const hasDetectedGps = profile.locations.some((l) => l.isCurrentGps);
    if (hasDetectedGps) return;

    let cancelled = false;

    const applyDetectedLocation = (loc: SavedLocation) => {
      if (cancelled) return;
      setProfile((prev) => ({
        ...prev,
        locations: [loc],
        activeLocationId: loc.id,
      }));
    };

    const detectViaIp = async () => {
      try {
        const res = await fetch('/api/location/auto-detect');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.city && data.latitude && data.longitude) {
          applyDetectedLocation({
            id: `auto-${Date.now()}`,
            label: 'Custom',
            customName: 'Network Detected',
            cityName: data.city,
            locality: data.region ? `${data.region} (Approximate IP)` : undefined,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            isCurrentGps: true,
          });
        }
      } catch (err) {
        console.warn('Network location auto-detection failed:', err);
      }
    };

    const runAutoDetect = async () => {
      // If browser geolocation permission is already granted, prefer exact coordinates
      if (typeof navigator !== 'undefined' && navigator.geolocation && navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                  const revRes = await fetch(
                    `/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`
                  );
                  if (revRes.ok) {
                    const rev = await revRes.json();
                    applyDetectedLocation({
                      id: `gps-${Date.now()}`,
                      label: 'Custom',
                      customName: 'GPS Verified',
                      cityName: rev.city || 'Current Area',
                      locality: rev.locality || undefined,
                      latitude,
                      longitude,
                      isCurrentGps: true,
                    });
                    return;
                  }
                } catch {
                  // fall through to IP
                }
                await detectViaIp();
              },
              () => {
                void detectViaIp();
              },
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
            );
            return;
          }
        } catch {
          // permissions API unsupported, fall through to IP
        }
      }

      await detectViaIp();
    };

    void runAutoDetect();

    return () => {
      cancelled = true;
    };
  }, []);
}

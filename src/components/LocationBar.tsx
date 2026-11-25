import React, { useState } from 'react';
import { SavedLocation } from '../types';
import { Navigation, MapPin, Loader2, AlertCircle, Search } from 'lucide-react';

interface LocationBarProps {
  activeLocation: SavedLocation;
  onSelectLocation: (location: SavedLocation) => void;
  isLoading: boolean;
}

/**
 * Location Intelligence Bar
 * @description Displays active monitored location, high-accuracy GPS "Locate Me", and instant city/area search
 */
export const LocationBar: React.FC<LocationBarProps> = ({
  activeLocation,
  onSelectLocation,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const resolveAndApplyCoords = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`);
      if (res.ok) {
        const data = await res.json();
        const gpsLoc: SavedLocation = {
          id: `gps-${Date.now()}`,
          label: 'Custom',
          customName: 'GPS Verified',
          cityName: data.city || `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          locality: data.locality || undefined,
          latitude,
          longitude,
          isCurrentGps: true,
        };
        onSelectLocation(gpsLoc);
        setIsLocating(false);
        return;
      }
    } catch {
      // fall through to raw coordinates
    }

    onSelectLocation({
      id: `gps-${Date.now()}`,
      label: 'Custom',
      customName: 'GPS Verified',
      cityName: `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      locality: 'Detected Coordinates',
      latitude,
      longitude,
      isCurrentGps: true,
    });
    setIsLocating(false);
  };

  const fallbackToServerIp = async (geoError?: GeolocationPositionError) => {
    try {
      const ipRes = await fetch('/api/location/auto-detect');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.city && ipData.latitude && ipData.longitude) {
          onSelectLocation({
            id: `ip-${Date.now()}`,
            label: 'Custom',
            customName: 'Network Detected',
            cityName: ipData.city,
            locality: ipData.region ? `${ipData.region} (Approximate IP)` : 'Network Detected',
            latitude: parseFloat(ipData.latitude),
            longitude: parseFloat(ipData.longitude),
            isCurrentGps: true,
          });
          if (geoError && geoError.code === geoError.PERMISSION_DENIED) {
            setLocateError(
              'Browser GPS permission was denied, so an approximate network IP location was used. Allow location access or search your city directly.'
            );
          }
          setIsLocating(false);
          return;
        }
      }
    } catch (serverErr) {
      console.warn('Server IP detection failed:', serverErr);
    }

    setIsLocating(false);
    if (geoError && geoError.code === geoError.PERMISSION_DENIED) {
      setLocateError(
        'Browser location permission was blocked. Please allow location access in your browser or search your city.'
      );
    } else {
      setLocateError('Unable to detect coordinates automatically. Please search your city or area.');
    }
  };

  const handleLocateMe = () => {
    setLocateError(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      void fallbackToServerIp();
      return;
    }

    // Attempt 1: High-accuracy GPS
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void resolveAndApplyCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          void fallbackToServerIp(err);
          return;
        }

        // Attempt 2: Standard network/Wi-Fi positioning (crucial for Windows/macOS desktops)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            void resolveAndApplyCoords(pos.coords.latitude, pos.coords.longitude);
          },
          (fallbackErr) => {
            void fallbackToServerIp(fallbackErr);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLocateError(null);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        setLocateError(`Could not find "${query}". Try a city or district name like Kolkata, Mumbai, or Jaipur.`);
        return;
      }
      const data = await res.json();
      onSelectLocation({
        id: `search-${Date.now()}`,
        label: 'Custom',
        customName: 'Searched Area',
        cityName: data.city || query,
        locality: data.locality || undefined,
        latitude: Number(data.lat),
        longitude: Number(data.lon),
        isCurrentGps: true,
      });
      setSearchQuery('');
    } catch {
      setLocateError('Unable to search location right now. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-emerald-800" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                {activeLocation.customName || 'Monitored Area'}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold text-emerald-900">
                {isLoading ? 'Updating station telemetry...' : 'Live Monitoring Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-tight">
                {activeLocation.cityName}
              </h2>
              {activeLocation.locality && (
                <span className="text-xs text-stone-500 font-normal">
                  ({activeLocation.locality})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <label htmlFor="location-search-input" className="sr-only">
              Search city or area
            </label>
            <input
              id="location-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or area..."
              className="w-full sm:w-48 min-h-[40px] px-3 py-2 text-xs bg-stone-50 border border-stone-200/90 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              aria-label="Search location"
              className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-200/80 disabled:opacity-50 transition-all"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 active:scale-95 disabled:opacity-50 transition-all shadow-2xs"
            title="Detect air quality at your precise coordinates"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Detecting GPS...' : 'Locate Me'}</span>
          </button>
        </div>
      </div>

      {locateError && (
        <div
          role="status"
          className="mt-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{locateError}</span>
        </div>
      )}
    </div>
  );
};

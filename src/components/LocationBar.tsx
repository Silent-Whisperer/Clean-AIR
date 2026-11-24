import React, { useState } from 'react';
import { SavedLocation } from '../types';
import {
  Navigation,
  MapPin,
  ChevronDown,
  Building,
  Home,
  GraduationCap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LocationModal } from './LocationModal';

interface LocationBarProps {
  locations: SavedLocation[];
  activeLocationId: string;
  onSelectLocation: (location: SavedLocation) => void;
  onAddLocation: (newLoc: SavedLocation) => void;
  onDeleteLocation: (id: string) => void;
  isLoading: boolean;
}

export const LocationBar: React.FC<LocationBarProps> = ({
  locations,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  isLoading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const activeLoc = locations.find((l) => l.id === activeLocationId) || locations[0];

  const handleLocateMe = async () => {
    setLocateError(null);
    setIsLocating(true);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // Strategy 1: High-Accuracy GPS Hardware Positioning
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          let detectedCity = 'Kolkata';
          let detectedLocality = 'Current Area';

          // Try Google Maps Geocoding first if key available
          let resolved = false;
          if (apiKey) {
            try {
              const gRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              if (gRes.ok) {
                const gData = await gRes.json();
                if (gData.status === 'OK' && gData.results?.length > 0) {
                  const result = gData.results[0];
                  const getComp = (type: string) =>
                    result.address_components.find((c: any) => c.types.includes(type))?.long_name;

                  detectedCity =
                    getComp('locality') ||
                    getComp('administrative_area_level_2') ||
                    getComp('administrative_area_level_1') ||
                    'Current Area';
                  detectedLocality =
                    getComp('sublocality') ||
                    getComp('neighborhood') ||
                    getComp('route') ||
                    '';
                  resolved = true;
                }
              }
            } catch {
              // fallback to nominatim
            }
          }

          if (!resolved) {
            // Free Tier A: OpenStreetMap Nominatim with granular neighborhood and sub-locality extraction
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                { headers: { 'User-Agent': 'ClearAir-Environmental-Health/1.0' } }
              );
              if (res.ok) {
                const data = await res.json();
                const addr = data.address || {};
                detectedCity = addr.city || addr.town || addr.state_district || addr.state || 'Kolkata';

                // Assemble precise micro-neighborhood: e.g. "Lake Terrace, Santoshpur" or "Santoshpur, Jadavpur"
                const parts = [
                  addr.road || addr.residential || addr.leisure || addr.amenity,
                  addr.neighbourhood,
                  addr.suburb,
                ].filter(Boolean);

                if (parts.length > 0) {
                  // Remove duplicates if any
                  const uniqueParts = Array.from(new Set(parts));
                  detectedLocality = uniqueParts.slice(0, 2).join(', ');
                } else {
                  detectedLocality = addr.county || addr.state_district || '';
                }
                resolved = true;
              }
            } catch {
              // fallback to BigDataCloud
            }
          }

          if (!resolved) {
            // Free Tier B: BigDataCloud Reverse Geocoding
            try {
              const bdcRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                detectedCity = bdcData.city || bdcData.locality || bdcData.principalSubdivision || 'Current City';
                detectedLocality = bdcData.locality || bdcData.principalSubdivision || '';
              }
            } catch {
              detectedCity = 'Current GPS Area';
            }
          }

          const gpsLoc: SavedLocation = {
            id: `gps-${Date.now()}`,
            label: 'Custom',
            customName: 'Current Location',
            cityName: detectedCity,
            locality: detectedLocality || undefined,
            latitude,
            longitude,
            isCurrentGps: true,
          };

          onAddLocation(gpsLoc);
          onSelectLocation(gpsLoc);
          setIsLocating(false);
        },
        async (err) => {
          // Strategy 2: If Hardware GPS is blocked/unavailable, fallback to IP Geolocation
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.city && ipData.latitude && ipData.longitude) {
                const detectedLoc: SavedLocation = {
                  id: `ip-${Date.now()}`,
                  label: 'Home',
                  customName: 'Current Location',
                  cityName: ipData.city,
                  locality: ipData.region ? `${ipData.region}, ${ipData.postal || ''}`.trim() : undefined,
                  latitude: parseFloat(ipData.latitude),
                  longitude: parseFloat(ipData.longitude),
                  isCurrentGps: true,
                };
                onAddLocation(detectedLoc);
                onSelectLocation(detectedLoc);
                setIsLocating(false);
                return;
              }
            }
          } catch {
            // failed IP lookup
          }

          setIsLocating(false);
          if (err.code === err.PERMISSION_DENIED) {
            setLocateError('Location permission denied. Please allow location access in your browser or search your city.');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setLocateError('GPS signal unavailable. Please search your city manually.');
          } else {
            setLocateError('Unable to detect location. Please select your city from the list.');
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
      return;
    }

    setLocateError('Browser geolocation is not supported on this device.');
    setIsLocating(false);
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-3.5 h-3.5 text-stone-600" />;
      case 'Work':
        return <Building className="w-3.5 h-3.5 text-stone-600" />;
      case 'College':
        return <GraduationCap className="w-3.5 h-3.5 text-stone-600" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <div className="relative mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
            {getLabelIcon(activeLoc.label)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                {activeLoc.customName || activeLoc.label}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold text-emerald-900">
                {isLoading ? 'Updating station telemetry...' : 'Live Monitoring Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-tight">
                {activeLoc.cityName}
              </h2>
              {activeLoc.locality && (
                <span className="text-xs text-stone-500 font-normal">
                  ({activeLoc.locality})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 transition-colors shadow-2xs"
            title="Detect air quality at your precise coordinates"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Detecting GPS...' : 'Locate Me'}</span>
          </button>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors border border-stone-200/80"
          >
            <span>Saved Places ({locations.length})</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>
      </div>

      {locateError && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{locateError}</span>
        </div>
      )}

      <LocationModal
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        locations={locations}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
        onAddLocation={onAddLocation}
        onDeleteLocation={onDeleteLocation}
        getLabelIcon={getLabelIcon}
      />
    </div>
  );
};

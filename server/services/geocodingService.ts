import { config } from '../config';

/**
 * Common Indian city & district coordinates index
 */
const INDIAN_DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; name: string; state: string }> = {
  // West Bengal
  westbengal: { lat: 22.5726, lon: 88.3639, name: 'Kolkata', state: 'West Bengal' },
  kolkata: { lat: 22.5726, lon: 88.3639, name: 'Kolkata', state: 'West Bengal' },
  howrah: { lat: 22.5958, lon: 88.2636, name: 'Howrah', state: 'West Bengal' },
  kalyani: { lat: 22.9750, lon: 88.4346, name: 'Kalyani', state: 'West Bengal' },
  durgapur: { lat: 23.5204, lon: 87.3119, name: 'Durgapur', state: 'West Bengal' },
  asansol: { lat: 23.6739, lon: 86.9524, name: 'Asansol', state: 'West Bengal' },
  siliguri: { lat: 26.7271, lon: 88.3953, name: 'Siliguri', state: 'West Bengal' },
  barasat: { lat: 22.7214, lon: 88.4816, name: 'Barasat', state: 'West Bengal' },
  saltlake: { lat: 22.5867, lon: 88.4170, name: 'Salt Lake', state: 'West Bengal' },

  // Delhi NCR
  delhi: { lat: 28.6139, lon: 77.2090, name: 'Delhi', state: 'Delhi' },
  newdelhi: { lat: 28.6139, lon: 77.2090, name: 'New Delhi', state: 'Delhi' },
  anandvihar: { lat: 28.6469, lon: 77.3160, name: 'Anand Vihar', state: 'Delhi' },
  noida: { lat: 28.5355, lon: 77.3910, name: 'Noida', state: 'Uttar Pradesh' },
  gurugram: { lat: 28.4595, lon: 77.0266, name: 'Gurugram', state: 'Haryana' },
  gurgaon: { lat: 28.4595, lon: 77.0266, name: 'Gurugram', state: 'Haryana' },
  ghaziabad: { lat: 28.6692, lon: 77.4538, name: 'Ghaziabad', state: 'Uttar Pradesh' },
  faridabad: { lat: 28.4089, lon: 77.3178, name: 'Faridabad', state: 'Haryana' },

  // Maharashtra
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai', state: 'Maharashtra' },
  thane: { lat: 19.2183, lon: 72.9781, name: 'Thane', state: 'Maharashtra' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune', state: 'Maharashtra' },
  nagpur: { lat: 21.1458, lon: 79.0882, name: 'Nagpur', state: 'Maharashtra' },
  navimumbai: { lat: 19.0330, lon: 73.0297, name: 'Navi Mumbai', state: 'Maharashtra' },

  // Karnataka & South
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: 'Hyderabad', state: 'Telangana' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai', state: 'Tamil Nadu' },
  kochi: { lat: 9.9312, lon: 76.2673, name: 'Kochi', state: 'Kerala' },

  // North & Central
  lucknow: { lat: 26.8467, lon: 80.9462, name: 'Lucknow', state: 'Uttar Pradesh' },
  kanpur: { lat: 26.4499, lon: 80.3319, name: 'Kanpur', state: 'Uttar Pradesh' },
  varanasi: { lat: 25.3176, lon: 82.9739, name: 'Varanasi', state: 'Uttar Pradesh' },
  patna: { lat: 25.5941, lon: 85.1376, name: 'Patna', state: 'Bihar' },
  jaipur: { lat: 26.9124, lon: 75.7873, name: 'Jaipur', state: 'Rajasthan' },
  ahmedabad: { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad', state: 'Gujarat' },
  bhopal: { lat: 23.2599, lon: 77.4126, name: 'Bhopal', state: 'Madhya Pradesh' },
  indore: { lat: 22.7196, lon: 75.8577, name: 'Indore', state: 'Madhya Pradesh' },
  chandigarh: { lat: 30.7333, lon: 76.7794, name: 'Chandigarh', state: 'Punjab/Haryana' },
};

/**
 * Geocodes a city or locality name to geographic coordinates
 * @param name - City, district, or neighborhood query
 * @returns Coordinates and formatted label, or null if unresolved
 */
export async function geocodeLocationName(
  name: string
): Promise<{ lat: number; lon: number; label: string; city: string; locality?: string } | null> {
  const clean = name.trim().replace(/[<>]/g, '');
  if (!clean) return null;

  const key = clean.toLowerCase().replace(/[^a-z]/g, '');
  if (INDIAN_DISTRICT_COORDINATES[key]) {
    const item = INDIAN_DISTRICT_COORDINATES[key];
    return {
      lat: item.lat,
      lon: item.lon,
      label: `${item.name}, ${item.state}`,
      city: item.name,
      locality: item.state,
    };
  }

  for (const [k, v] of Object.entries(INDIAN_DISTRICT_COORDINATES)) {
    if (key.includes(k) || k.includes(key)) {
      return {
        lat: v.lat,
        lon: v.lon,
        label: `${v.name}, ${v.state}`,
        city: v.name,
        locality: v.state,
      };
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(clean)}&addressdetails=1&limit=1`,
      {
        headers: { 'User-Agent': 'ClearAir-Environmental-Health/2.0' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const city =
          addr.city || addr.town || addr.village || addr.municipality || addr.state_district || item.name || clean;
        const locality = addr.suburb || addr.neighbourhood || addr.state || undefined;
        return {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          label: item.display_name || item.name || clean,
          city,
          locality: locality !== city ? locality : undefined,
        };
      }
    }
  } catch (err) {
    console.warn(`[Geocoding] OSM query failed for "${name}":`, (err as Error).message);
  }

  return null;
}

/**
 * Reverse-geocodes exact GPS coordinates into municipal city and neighborhood locality
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees
 * @returns Resolved city, locality, state, and coordinates
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ city: string; locality?: string; state?: string; latitude: number; longitude: number; source: string }> {
  // 1. Google Maps Geocoding (if configured)
  if (config.googleMapsApiKey) {
    try {
      const gRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${encodeURIComponent(config.googleMapsApiKey)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (gRes.ok) {
        const gData = (await gRes.json()) as any;
        if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
          const result = gData.results[0];
          const getComp = (type: string) =>
            result.address_components?.find((c: any) => Array.isArray(c.types) && c.types.includes(type))?.long_name;
          const city =
            getComp('locality') ||
            getComp('administrative_area_level_2') ||
            getComp('administrative_area_level_1') ||
            'Current Area';
          const locality =
            getComp('sublocality_level_1') ||
            getComp('sublocality') ||
            getComp('neighborhood') ||
            getComp('route');
          const state = getComp('administrative_area_level_1');
          return { city, locality, state, latitude: lat, longitude: lon, source: 'google_maps' };
        }
      }
    } catch {
      // fall through to Nominatim
    }
  }

  // 2. OpenStreetMap Nominatim (server-side with valid User-Agent)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      {
        headers: { 'User-Agent': 'ClearAir-Environmental-Health/2.0 (public-health-telemetry)' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as any;
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.city_district ||
        addr.state_district ||
        addr.county ||
        addr.state;

      const localityParts = [
        addr.suburb || addr.neighbourhood || addr.residential || addr.quarter,
        addr.city_district && addr.city_district !== city ? addr.city_district : undefined,
      ].filter(Boolean);
      const uniqueParts = Array.from(new Set(localityParts));
      const locality =
        uniqueParts.length > 0
          ? uniqueParts.slice(0, 2).join(', ')
          : addr.road || addr.state_district || addr.state || undefined;

      if (city) {
        return {
          city,
          locality: locality && locality !== city ? locality : undefined,
          state: addr.state,
          latitude: lat,
          longitude: lon,
          source: 'nominatim',
        };
      }
    }
  } catch {
    // fall through to BigDataCloud
  }

  // 3. BigDataCloud fallback
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (bdcRes.ok) {
      const bdcData = (await bdcRes.json()) as any;
      const city = bdcData.city || bdcData.locality || bdcData.principalSubdivision;
      if (city) {
        return {
          city,
          locality: bdcData.locality && bdcData.locality !== city ? bdcData.locality : bdcData.principalSubdivision,
          state: bdcData.principalSubdivision,
          latitude: lat,
          longitude: lon,
          source: 'bigdatacloud',
        };
      }
    }
  } catch {
    // fall through
  }

  return {
    city: `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    locality: 'Detected Coordinates',
    latitude: lat,
    longitude: lon,
    source: 'coordinates',
  };
}

/**
 * Resolves accurate coordinates and matching label for telemetry queries
 * @param query - City or locality name
 * @param lat - Optional latitude
 * @param lon - Optional longitude
 * @returns Resolved latitude, longitude, and display label
 */
export async function resolveExactCoordinates(
  query: string,
  lat?: number,
  lon?: number
): Promise<{ lat: number; lon: number; label: string }> {
  const normalizedQuery = (query || '').trim().toLowerCase();

  if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
    const isLegacyDelhiCoords =
      (Math.abs(lat - 28.6469) < 0.05 && Math.abs(lon - 77.3160) < 0.05) ||
      (Math.abs(lat - 28.6139) < 0.05 && Math.abs(lon - 77.2090) < 0.05);

    const queryMentionsDelhi =
      !normalizedQuery ||
      normalizedQuery.includes('delhi') ||
      normalizedQuery.includes('anand vihar') ||
      normalizedQuery.includes('noida') ||
      normalizedQuery.includes('ghaziabad');

    if (!isLegacyDelhiCoords || queryMentionsDelhi) {
      return { lat, lon, label: query || `${lat.toFixed(2)}, ${lon.toFixed(2)}` };
    }
  }

  const geocoded = await geocodeLocationName(query);
  if (geocoded) {
    return { lat: geocoded.lat, lon: geocoded.lon, label: geocoded.label };
  }

  return { lat: 22.5726, lon: 88.3639, label: query || 'Kolkata, West Bengal' };
}

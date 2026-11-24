
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
 * Geocodes an unknown city/locality dynamically via OpenStreetMap Nominatim
 */
export async function geocodeLocationName(name: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const clean = name.trim().replace(/[<>]/g, '');
  if (!clean) return null;

  const key = clean.toLowerCase().replace(/[^a-z]/g, '');
  if (INDIAN_DISTRICT_COORDINATES[key]) {
    const item = INDIAN_DISTRICT_COORDINATES[key];
    return { lat: item.lat, lon: item.lon, label: `${item.name}, ${item.state}` };
  }

  // Check partial match
  for (const [k, v] of Object.entries(INDIAN_DISTRICT_COORDINATES)) {
    if (key.includes(k) || k.includes(key)) {
      return { lat: v.lat, lon: v.lon, label: `${v.name}, ${v.state}` };
    }
  }

  // Dynamic geocoding
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=1`,
      { headers: { 'User-Agent': 'ClearAir-Environmental-Health/2.0' } }
    );
    if (res.ok) {
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          label: item.name || clean,
        };
      }
    }
  } catch (err) {
    console.warn(`[Geocoding] OSM query failed for "${name}":`, (err as Error).message);
  }

  return null;
}

/**
 * Resolves accurate coordinates and matching label
 * Checks whether old Anand Vihar coordinates (28.6469, 77.3160) are being passed for a non-Delhi query!
 */
export async function resolveExactCoordinates(query: string, lat?: number, lon?: number) {
  const normalizedQuery = (query || '').trim().toLowerCase();

  // If coordinates are explicitly given, verify they actually belong to the query city!
  if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
    // Detect if Anand Vihar / Delhi coordinates were inherited in local storage for a different city/state (e.g. West Bengal, Kolkata, Mumbai)
    const isDelhiOrAnandViharCoords =
      (Math.abs(lat - 28.6469) < 0.05 && Math.abs(lon - 77.3160) < 0.05) ||
      (Math.abs(lat - 28.6139) < 0.05 && Math.abs(lon - 77.2090) < 0.05);

    const queryMentionsDelhi =
      normalizedQuery.includes('delhi') ||
      normalizedQuery.includes('anand vihar') ||
      normalizedQuery.includes('noida') ||
      normalizedQuery.includes('ghaziabad');

    // Only trust coordinates if they don't mismatch!
    if (!isDelhiOrAnandViharCoords || queryMentionsDelhi) {
      return { lat, lon, label: query || 'Monitored Coordinates' };
    }
  }

  // Geocode query to get the true geographic location
  const geocoded = await geocodeLocationName(query);
  if (geocoded) {
    return { lat: geocoded.lat, lon: geocoded.lon, label: geocoded.label };
  }

  // Default to Kolkata (user's real IP origin in India) if query not found
  return { lat: 22.5726, lon: 88.3639, label: query || 'Kolkata, West Bengal' };
}

/**
 * Network IP Geolocation Service
 * @description Automatically detects user municipal location and geographic coordinates via IP routing
 */
export class LocationService {
  /**
   * Resolves client IP to geographic coordinates and municipal city name
   * @param clientIp - Optional client IP address from request headers
   * @returns Detected location object with city, region, latitude, longitude
   */
  public static async detectLocationFromIp(clientIp?: string): Promise<{
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    source: string;
  }> {
    let targetIp = clientIp || '';

    // Strip IPv6-mapped IPv4 prefix if present (e.g. ::ffff:192.168.1.1)
    if (targetIp.startsWith('::ffff:')) {
      targetIp = targetIp.substring(7);
    }

    // Check if IP is private or loopback (127.0.0.1, ::1, 10.*, 192.168.*, 172.16-31.*)
    const isPrivate =
      !targetIp ||
      targetIp === '127.0.0.1' ||
      targetIp === '::1' ||
      targetIp.startsWith('10.') ||
      targetIp.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(targetIp);

    // If private/local, fetch public IP
    if (isPrivate) {
      try {
        const ipifyRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
        if (ipifyRes.ok) {
          const ipData = (await ipifyRes.json()) as { ip?: string };
          if (ipData.ip) targetIp = ipData.ip;
        }
      } catch {
        targetIp = '';
      }
    }

    // Strategy 1: ip-api.com
    try {
      const url = targetIp && targetIp !== '' ? `http://ip-api.com/json/${targetIp}` : 'http://ip-api.com/json/';
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.status === 'success' && data.city && data.lat && data.lon) {
          return {
            city: data.city,
            region: data.regionName || data.region || 'India',
            latitude: parseFloat(data.lat),
            longitude: parseFloat(data.lon),
            source: 'ip-api',
          };
        }
      }
    } catch {
      // Fall through to Strategy 2
    }

    // Strategy 2: freeipapi.com fallback
    try {
      const fallbackUrl = targetIp && targetIp !== ''
        ? `https://freeipapi.com/api/json/${targetIp}`
        : 'https://freeipapi.com/api/json/';
      const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.cityName && data.latitude && data.longitude) {
          return {
            city: data.cityName,
            region: data.regionName || 'India',
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            source: 'freeipapi',
          };
        }
      }
    } catch {
      // Fall through to safe metropolitan fallback
    }

    // Default safe metropolitan anchor if all IP providers are unreachable
    return {
      city: 'Kolkata',
      region: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      source: 'fallback',
    };
  }
}

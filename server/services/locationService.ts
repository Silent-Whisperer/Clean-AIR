/**
 * Network IP Geolocation Service
 * @description Automatically detects user municipal location and geographic coordinates via IP routing
 */
export class LocationService {
  /**
   * Checks whether an IP address is private, loopback, or link-local
   * @param ip - Candidate IP string
   * @returns True if private/loopback
   */
  private static isPrivateIp(ip: string): boolean {
    if (!ip) return true;
    const clean = ip.trim();
    return (
      clean === '127.0.0.1' ||
      clean === '::1' ||
      clean === 'localhost' ||
      clean.startsWith('10.') ||
      clean.startsWith('192.168.') ||
      clean.startsWith('169.254.') ||
      clean.startsWith('fc00:') ||
      clean.startsWith('fd00:') ||
      clean.startsWith('fe80:') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)
    );
  }

  /**
   * Resolves client IP to geographic coordinates and municipal city name
   * @param clientIp - Optional client IP address from request headers
   * @returns Detected location object with city, region, latitude, longitude, and source
   */
  public static async detectLocationFromIp(clientIp?: string): Promise<{
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    source: string;
    isApproximateIp: boolean;
  }> {
    let targetIp = (clientIp || '').trim();

    // Strip IPv6-mapped IPv4 prefix if present (e.g. ::ffff:192.168.1.1)
    if (targetIp.startsWith('::ffff:')) {
      targetIp = targetIp.substring(7);
    }

    // If running locally (private/loopback), resolve public IP of the local machine
    if (this.isPrivateIp(targetIp)) {
      targetIp = '';
      try {
        const ipifyRes = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(3000),
        });
        if (ipifyRes.ok) {
          const ipData = (await ipifyRes.json()) as { ip?: string };
          if (ipData.ip && !this.isPrivateIp(ipData.ip)) {
            targetIp = ipData.ip;
          }
        }
      } catch {
        targetIp = '';
      }
    }

    // Strategy 1: ipwho.is (HTTPS, accurate ISP/city resolution, no key required)
    try {
      const url = targetIp ? `https://ipwho.is/${encodeURIComponent(targetIp)}` : 'https://ipwho.is/';
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          city?: string;
          region?: string;
          latitude?: number | string;
          longitude?: number | string;
        };
        if (data.success !== false && data.city && data.latitude && data.longitude) {
          return {
            city: data.city,
            region: data.region || 'India',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            source: 'ipwho.is',
            isApproximateIp: true,
          };
        }
      }
    } catch {
      // Fall through to Strategy 2
    }

    // Strategy 2: ip-api.com
    try {
      const url = targetIp ? `http://ip-api.com/json/${encodeURIComponent(targetIp)}` : 'http://ip-api.com/json/';
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          city?: string;
          region?: string;
          latitude?: number | string;
          longitude?: number | string;
        };
        if (data.status === 'success' && data.city && data.lat && data.lon) {
          return {
            city: data.city,
            region: data.regionName || data.region || 'India',
            latitude: parseFloat(data.lat),
            longitude: parseFloat(data.lon),
            source: 'ip-api',
            isApproximateIp: true,
          };
        }
      }
    } catch {
      // Fall through to Strategy 3
    }

    // Strategy 3: freeipapi.com fallback
    try {
      const fallbackUrl = targetIp
        ? `https://freeipapi.com/api/json/${encodeURIComponent(targetIp)}`
        : 'https://freeipapi.com/api/json/';
      const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          city?: string;
          region?: string;
          latitude?: number | string;
          longitude?: number | string;
        };
        if (data.cityName && data.latitude && data.longitude) {
          return {
            city: data.cityName,
            region: data.regionName || 'India',
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            source: 'freeipapi',
            isApproximateIp: true,
          };
        }
      }
    } catch {
      // Fall through
    }

    return {
      city: 'Kolkata',
      region: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      source: 'fallback',
      isApproximateIp: true,
    };
  }
}

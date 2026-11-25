// Real Geolocation Position Service (100% Free OpenStreetMap Nominatim + HTML5 Geolocation API)

export interface GeoLocationResult {
  locationName: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
}

const POPULAR_LOCATIONS = [
  'Mumbai, Maharashtra, India',
  'New Delhi, Delhi, India',
  'Bengaluru, Karnataka, India',
  'Dubai, United Arab Emirates',
  'London, United Kingdom',
  'New York, NY, USA',
  'Tokyo, Japan',
  'Paris, France',
  'Goa, India',
  'Los Angeles, CA, USA',
  'Sydney, Australia',
  'Singapore',
];

export async function detectCurrentLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        locationName: 'Mumbai, Maharashtra, India',
        city: 'Mumbai',
        country: 'India',
        lat: 19.076,
        lon: 72.8777,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
            {
              headers: { 'User-Agent': 'VYRO-Social-Engine/2.0' },
              signal: AbortSignal.timeout(4000),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'Local Node';
            const state = addr.state ? `, ${addr.state}` : '';
            const country = addr.country ? `, ${addr.country}` : '';
            const locationName = `${city}${state}${country}`;

            resolve({
              locationName,
              city,
              country: addr.country,
              lat,
              lon,
            });
            return;
          }
        } catch {
          // Fallback on timeout / rate-limit
        }

        resolve({
          locationName: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
          lat,
          lon,
        });
      },
      () => {
        // Fallback when permission denied or unavailable
        resolve({
          locationName: 'Mumbai, Maharashtra, India',
          city: 'Mumbai',
          country: 'India',
          lat: 19.076,
          lon: 72.8777,
        });
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

export async function searchLocations(query: string): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_LOCATIONS.slice(0, 8);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=en`,
      {
        headers: { 'User-Agent': 'VYRO-Social-Engine/2.0' },
        signal: AbortSignal.timeout(3500),
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => item.display_name.split(',').slice(0, 3).join(',').trim());
      }
    }
  } catch {
    // Fallback search
  }

  return POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q));
}

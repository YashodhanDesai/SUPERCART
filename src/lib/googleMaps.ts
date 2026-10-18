import { AddressDetails } from '../types';

export const GOOGLE_MAPS_API_KEY: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_PLATFORM_KEY) ||
  'AIzaSyBmg46MN6hX4aHA5nCvZH2kwgpVIl8v6Dg';

export const GOOGLE_MAPS_MAP_ID = 'DEMO_MAP_ID';
export const MANDATORY_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

// Sleek dark theme styling for Google Maps
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e4e4e7' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#14291f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34d399' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#27272a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212124' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3f3f46' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2421' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f59e0b' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3336' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6ee7b7' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091e2b' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#091e2b' }]
  }
];

/**
 * Extracts structured postal and location fields from Google Address Components
 */
export function parseGoogleAddressComponents(
  components: google.maps.GeocoderAddressComponent[] | any[],
  formattedAddress: string,
  coords: { lat: number; lng: number }
): AddressDetails {
  let houseNumber = '';
  let street = '';
  let sublocality = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country = '';

  for (const comp of components) {
    const types: string[] = comp.types || [];
    if (types.includes('street_number')) {
      houseNumber = comp.long_name || comp.short_name;
    } else if (types.includes('route')) {
      street = comp.long_name || comp.short_name;
    } else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
      sublocality = comp.long_name || comp.short_name;
    } else if (types.includes('locality')) {
      city = comp.long_name || comp.short_name;
    } else if (!city && (types.includes('administrative_area_level_2') || types.includes('postal_town'))) {
      city = comp.long_name || comp.short_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = comp.long_name || comp.short_name;
    } else if (types.includes('postal_code')) {
      postalCode = comp.long_name || comp.short_name;
    } else if (types.includes('country')) {
      country = comp.long_name || comp.short_name;
    }
  }

  const combinedStreet = [houseNumber, street, sublocality].filter(Boolean).join(', ') || sublocality || street;

  return {
    formattedAddress,
    lat: coords.lat,
    lng: coords.lng,
    houseNumber: houseNumber || undefined,
    street: combinedStreet || undefined,
    city: city || undefined,
    state: state || undefined,
    postalCode: postalCode || undefined,
    country: country || 'India'
  };
}

/**
 * High-accuracy reverse geocoding via Google Maps
 */
export async function reverseGeocodeGoogle(
  lat: number,
  lng: number
): Promise<AddressDetails> {
  // If Google Maps JS Geocoder is loaded in window
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoder status: ${status}`));
          }
        });
      });

      if (response && response.length > 0) {
        const topResult = response[0];
        return parseGoogleAddressComponents(topResult.address_components, topResult.formatted_address, { lat, lng });
      }
    } catch (err) {
      console.warn('Google JS Geocoder error, trying REST fallback:', err);
    }
  }

  // REST fallback
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const top = data.results[0];
      return parseGoogleAddressComponents(top.address_components, top.formatted_address, { lat, lng });
    }
  } catch (err) {
    console.warn('Geocoding REST fetch error:', err);
  }

  // Graceful fallback formatted string with exact coordinates
  return {
    formattedAddress: `Selected Pin (${lat.toFixed(5)}°, ${lng.toFixed(5)}°), India`,
    lat,
    lng,
    country: 'India'
  };
}

/**
 * Forward geocoding of place/pincode query
 */
export async function forwardGeocodeGoogle(
  addressQuery: string
): Promise<AddressDetails | null> {
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ address: addressQuery, componentRestrictions: { country: 'IN' } }, (results: any[], status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoder status: ${status}`));
          }
        });
      });

      if (response && response.length > 0) {
        const top = response[0];
        const lat = top.geometry.location.lat();
        const lng = top.geometry.location.lng();
        return parseGoogleAddressComponents(top.address_components, top.formatted_address, { lat, lng });
      }
    } catch (err) {
      console.warn('Google JS Forward Geocoder error:', err);
    }
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&components=country:IN&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const top = data.results[0];
      const lat = top.geometry.location.lat;
      const lng = top.geometry.location.lng;
      return parseGoogleAddressComponents(top.address_components, top.formatted_address, { lat, lng });
    }
  } catch (err) {
    console.warn('Forward geocode REST error:', err);
  }

  return null;
}

/**
 * Decodes Google encoded polyline string to lat/lng coordinates array
 */
export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

export interface RouteComputationResult {
  distanceKm: number;
  durationMinutes: number;
  points: { lat: number; lng: number }[];
}

/**
 * Compute realistic route between Store Hub and Customer Doorstep
 */
export async function computeDrivingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteComputationResult> {
  try {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: 'DRIVE'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const meters = route.distanceMeters || 2400;
        const durationSec = parseInt(route.duration?.replace('s', '') || '900', 10);
        const encoded = route.polyline?.encodedPolyline;
        const points = encoded ? decodePolyline(encoded) : generateFallbackRoutePoints(origin, destination);

        return {
          distanceKm: Math.max(0.5, parseFloat((meters / 1000).toFixed(1))),
          durationMinutes: Math.max(5, Math.round(durationSec / 60)),
          points
        };
      }
    }
  } catch (err) {
    console.warn('Routes API compute error, falling back to interpolated path:', err);
  }

  // Graceful realistic curved path fallback
  const distanceKm = parseFloat((calculateCrowFlightKm(origin, destination) * 1.3).toFixed(1));
  const durationMinutes = Math.max(8, Math.round(distanceKm * 3.5));
  const points = generateFallbackRoutePoints(origin, destination);

  return {
    distanceKm,
    durationMinutes,
    points
  };
}

function calculateCrowFlightKm(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateFallbackRoutePoints(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  numSegments: number = 20
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    // Add small road-like curvature
    const sinOffset = Math.sin(t * Math.PI) * 0.003;
    const cosOffset = Math.sin(t * Math.PI * 2) * 0.002;
    points.push({
      lat: origin.lat + (dest.lat - origin.lat) * t + sinOffset,
      lng: origin.lng + (dest.lng - origin.lng) * t + cosOffset
    });
  }
  return points;
}

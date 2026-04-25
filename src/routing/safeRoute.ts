import { Incident, RouteOption, SafeRoutePlan } from '../types';

interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface PhotonResponse {
  features: Array<{
    properties: {
      name?: string;
      street?: string;
      housenumber?: string;
      district?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    geometry: {
      coordinates: [number, number];
    };
  }>;
}

interface OsrmRouteResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceMeters = (a: [number, number], b: [number, number]) => {
  const earthRadius = 6_371_000;
  const dLat = toRadians(b[0] - a[0]);
  const dLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
};

const sampleGeometry = (geometry: [number, number][], maxPoints = 50) => {
  if (geometry.length <= maxPoints) {
    return geometry;
  }

  const step = Math.ceil(geometry.length / maxPoints);
  return geometry.filter((_, index) => index % step === 0 || index === geometry.length - 1);
};

const scoreRoute = (geometry: [number, number][], incidents: Incident[]) => {
  const sampled = sampleGeometry(geometry);
  let riskScore = 0;
  let blockedHighCount = 0;
  let cautionCount = 0;

  for (const incident of incidents) {
    let nearestMeters = Number.POSITIVE_INFINITY;

    for (const point of sampled) {
      nearestMeters = Math.min(nearestMeters, haversineDistanceMeters(point, [incident.lat, incident.lng]));
    }

    if (nearestMeters > 250) {
      continue;
    }

    const proximityWeight = 1 - nearestMeters / 250;
    if (incident.severity === 'high') {
      blockedHighCount += 1;
      riskScore += 120 + proximityWeight * 180;
    } else {
      cautionCount += 1;
      riskScore += 25 + proximityWeight * 45;
    }
  }

  return { riskScore, blockedHighCount, cautionCount };
};

const chooseSafestRoute = (routes: RouteOption[]) => {
  return [...routes].sort((left, right) => {
    if (left.blockedHighCount !== right.blockedHighCount) {
      return left.blockedHighCount - right.blockedHighCount;
    }

    if (left.riskScore !== right.riskScore) {
      return left.riskScore - right.riskScore;
    }

    return left.durationSeconds - right.durationSeconds;
  })[0];
};

const normalizeDestinationQuery = (query: string) => {
  return query
    .trim()
    .replace(/\bC\./gi, 'Calle')
    .replace(/\bAv\./gi, 'Avenida')
    .replace(/\bCol\./gi, 'Colonia')
    .replace(/\bFracc\./gi, 'Fraccionamiento')
    .replace(/\bJal\./gi, 'Jalisco')
    .replace(/\s+/g, ' ');
};

const fetchNominatim = async (query: string): Promise<GeocodeResult | null> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as NominatimResult[];
  const preferred = results.find((result) => /guadalajara|jalisco|mexico/i.test(result.display_name)) ?? results[0];
  if (!preferred) {
    return null;
  }

  return {
    name: preferred.display_name,
    lat: Number(preferred.lat),
    lng: Number(preferred.lon),
  };
};

const fetchPhoton = async (query: string): Promise<GeocodeResult | null> => {
  const response = await fetch(`https://photon.komoot.io/api/?limit=5&q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as PhotonResponse;
  const preferred =
    results.features.find((feature) => /guadalajara|jalisco|mex/i.test(`${feature.properties.city ?? ''} ${feature.properties.state ?? ''} ${feature.properties.country ?? ''}`)) ??
    results.features[0];

  if (!preferred) {
    return null;
  }

  const parts = [
    preferred.properties.name,
    preferred.properties.street,
    preferred.properties.housenumber,
    preferred.properties.district,
    preferred.properties.city,
    preferred.properties.state,
  ].filter(Boolean);

  return {
    name: parts.join(', '),
    lat: preferred.geometry.coordinates[1],
    lng: preferred.geometry.coordinates[0],
  };
};

export const geocodeDestination = async (query: string): Promise<GeocodeResult> => {
  const normalizedQuery = normalizeDestinationQuery(query);
  const attempts = [query, normalizedQuery, `${normalizedQuery}, Guadalajara, Jalisco, Mexico`];

  for (const candidate of attempts) {
    const nominatimMatch = await fetchNominatim(candidate);
    if (nominatimMatch) {
      return nominatimMatch;
    }

    const photonMatch = await fetchPhoton(candidate);
    if (photonMatch) {
      return photonMatch;
    }
  }

  throw new Error('No destination matched that search. Try a street and neighborhood, for example: Lopez Cotilla 1505 Americana Guadalajara.');
};

export const buildSafeRoutePlan = async (
  origin: [number, number],
  destinationQuery: string,
  incidents: Incident[],
): Promise<SafeRoutePlan> => {
  const destination = await geocodeDestination(destinationQuery);
  const routeResponse = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination.lng},${destination.lat}?alternatives=true&overview=full&geometries=geojson&steps=false`,
  );

  if (!routeResponse.ok) {
    throw new Error('Routing is unavailable right now.');
  }

  const payload = (await routeResponse.json()) as OsrmRouteResponse;
  if (!payload.routes?.length) {
    throw new Error('No drivable route was found.');
  }

  const routes = payload.routes.slice(0, 3).map((route, index) => {
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
    const score = scoreRoute(geometry, incidents);

    return {
      id: `route-${index + 1}`,
      geometry,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      ...score,
    } satisfies RouteOption;
  });

  const safest = chooseSafestRoute(routes);
  return {
    destinationName: destination.name,
    destination: [destination.lat, destination.lng],
    selectedRouteId: safest.id,
    routes,
  };
};
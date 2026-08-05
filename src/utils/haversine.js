// Ported from Salvatore's app.js

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c;
}

export function findNearestStop(lat, lon, stops) {
  let nearest = null;
  let minDistance = Infinity;

  for (const stop of stops) {
    const distance = haversineDistance(lat, lon, stop.lat, stop.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = stop;
    }
  }

  return { stop: nearest, distanceKm: minDistance };
}

import { haversineDistance } from './haversine';
import { CITIES, CITY_RADIUS_KM } from '../data/cities';

/**
 * Work out which pilot city a position belongs to.
 * Returns the city id, or null if the reporter is nowhere near any of them
 * (in which case the app asks them to pick manually).
 */
export function detectCity(lat, lon) {
  let best = null;
  let bestDistance = Infinity;

  for (const city of CITIES) {
    const distance = haversineDistance(lat, lon, city.center.lat, city.center.lon);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = city;
    }
  }

  if (!best || bestDistance > CITY_RADIUS_KM) return null;
  return best.id;
}

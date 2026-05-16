/**
 * Haversine Distance Calculator
 *
 * Calculates the great-circle distance between two points
 * on Earth given their latitude and longitude in decimal degrees.
 *
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (deg) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

/**
 * Convert distance to a score (0-1)
 * Closer distance = higher score
 * Uses exponential decay for natural falloff
 *
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} maxDistanceKm - Maximum considered distance (default 100km)
 * @returns {number} Score between 0 and 1
 */
const distanceToScore = (distanceKm, maxDistanceKm = 100) => {
  if (distanceKm <= 0) return 1;
  if (distanceKm >= maxDistanceKm) return 0;

  // Exponential decay: closer = much higher score
  return Math.exp(-distanceKm / (maxDistanceKm / 3));
};

module.exports = { haversineDistance, distanceToScore };

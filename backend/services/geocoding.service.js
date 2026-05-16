const axios = require('axios');

/**
 * Geocoding Service
 * Converts addresses to coordinates using OpenStreetMap Nominatim API
 * Includes caching to avoid rate limiting
 */

// Simple in-memory cache (in production, use Redis)
const geocodeCache = new Map();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Geocode an address to coordinates
 * @param {string} address - Full address to geocode
 * @returns {Promise<{lat: number, lng: number, displayName: string}>}
 */
const geocodeAddress = async (address) => {
  if (!address || typeof address !== 'string') {
    throw new Error('Valid address string is required');
  }

  // Check cache first
  const cacheKey = address.toLowerCase().trim();
  const cached = geocodeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'ImpactQuest-Humanitarian-Platform/1.0'
      },
      timeout: 5000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data[0];
    const geocoded = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || '',
      country: result.address?.country || ''
    };

    // Cache the result
    geocodeCache.set(cacheKey, {
      data: geocoded,
      timestamp: Date.now()
    });

    return geocoded;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Geocoding rate limit exceeded. Please try again later.');
    }
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, country: string}>}
 */
const reverseGeocode = async (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Valid latitude and longitude are required');
  }

  const cacheKey = `${lat},${lng}`;
  const cached = geocodeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'ImpactQuest-Humanitarian-Platform/1.0'
      },
      timeout: 5000
    });

    if (!response.data) {
      throw new Error('Location not found');
    }

    const result = {
      address: response.data.display_name,
      city: response.data.address?.city || response.data.address?.town || response.data.address?.village || '',
      country: response.data.address?.country || ''
    };

    // Cache the result
    geocodeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Geocoding rate limit exceeded. Please try again later.');
    }
    throw new Error(`Reverse geocoding failed: ${error.message}`);
  }
};

/**
 * Get approximate coordinates for a city/country
 * Useful for fallback when exact address geocoding fails
 */
const getApproximateCoordinates = (city, country) => {
  // Common city coordinates as fallback
  const cityCoords = {
    'san francisco': [-122.4194, 37.7749],
    'new york': [-74.0060, 40.7128],
    'london': [-0.1278, 51.5074],
    'paris': [2.3522, 48.8566],
    'tokyo': [139.6917, 35.6895],
    'mumbai': [72.8777, 19.0760],
    'delhi': [77.1025, 28.7041],
    'bangalore': [77.5946, 12.9716],
    'sydney': [151.2093, -33.8688],
    'toronto': [-79.3832, 43.6532]
  };

  const key = city?.toLowerCase();
  return cityCoords[key] || [0, 0];
};

/**
 * Clear geocoding cache (useful for testing)
 */
const clearCache = () => {
  geocodeCache.clear();
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getApproximateCoordinates,
  clearCache
};

// Made with Bob

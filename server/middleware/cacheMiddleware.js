const { getRedisClient } = require('../config/redis');

// Thundering Herd Protection:
// Map of actively pending Promise resolutions for a specific cache key
const pendingPromises = new Map();

/**
 * Custom caching utility that protects against Thundering Herd.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that returns the data from the DB if cache miss
 * @param {number} ttlInSeconds - Number of seconds to cache the data
 * @returns {Promise<any>}
 */
const getOrSetCache = async (key, fetcher, ttlInSeconds = 3600) => {
    const redis = getRedisClient();

    // 1. If Redis is down/unconfigured, just bypass cache
    if (!redis) {
        return await fetcher();
    }

    try {
        // 2. Try fetching from Redis
        const cachedData = await redis.get(key);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // 3. Cache Miss Mechanism (Thundering Herd Protection)
        // If another simultaneous request is already fetching this exact key, WAIT for it to finish
        if (pendingPromises.has(key)) {
            return await pendingPromises.get(key);
        }

        // 4. No pending fetch exists, so THIS request takes the lock
        const fetchPromise = (async () => {
            try {
                // Fetch actual data from DB
                const data = await fetcher();

                // Store in Redis (fire and forget)
                if (data) {
                    redis.setEx(key, ttlInSeconds, JSON.stringify(data)).catch((err) => {
                        console.error(`Redis Save Error for ${key}:`, err);
                    });
                }

                return data;
            } finally {
                // 5. Always release the lock whether fetcher succeeds or fails
                pendingPromises.delete(key);
            }
        })();

        // Register the pending promise so concurrent requests await it
        pendingPromises.set(key, fetchPromise);

        return await fetchPromise;
    } catch (err) {
        console.error('Cache middleware error:', err);
        // Fallback to DB if Redis operation throws
        return await fetcher();
    }
};

module.exports = { getOrSetCache };

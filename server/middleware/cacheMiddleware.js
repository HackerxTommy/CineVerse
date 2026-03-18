const { getRedisClient } = require('../config/redis');

// Thundering Herd Protection:
// Map of actively pending Promise resolutions for a specific cache key
const pendingPromises = new Map();

/**
 * Custom caching utility that protects against Thundering Herd.
 * Now uses Upstash REST Redis (@upstash/redis) instead of TCP redis.
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
        // 2. Try fetching from Redis (Upstash REST - returns parsed JSON automatically)
        const cachedData = await redis.get(key);
        if (cachedData) {
            // Upstash auto-deserializes, so check if it's already an object
            return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        }

        // 3. Cache Miss Mechanism (Thundering Herd Protection)
        if (pendingPromises.has(key)) {
            return await pendingPromises.get(key);
        }

        // 4. No pending fetch exists, so THIS request takes the lock
        const fetchPromise = (async () => {
            try {
                const data = await fetcher();

                // Store in Redis using Upstash REST (setex = set with expiry)
                if (data) {
                    redis.setex(key, ttlInSeconds, JSON.stringify(data)).catch((err) => {
                        console.error(`Redis Save Error for ${key}:`, err.message);
                    });
                }

                return data;
            } finally {
                pendingPromises.delete(key);
            }
        })();

        pendingPromises.set(key, fetchPromise);

        return await fetchPromise;
    } catch (err) {
        console.error('Cache middleware error:', err.message);
        // Fallback to DB if Redis operation throws
        return await fetcher();
    }
};

module.exports = { getOrSetCache };

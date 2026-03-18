const { Redis } = require('@upstash/redis');

let redisClient = null;

const initRedis = () => {
    if (!process.env.REDIS_REST_URL || !process.env.REDIS_REST_TOKEN) {
        console.log('Redis is disabled (REDIS_REST_URL or REDIS_REST_TOKEN not provided)');
        return null;
    }

    try {
        redisClient = new Redis({
            url: process.env.REDIS_REST_URL,
            token: process.env.REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis (REST) Enabled');
    } catch (err) {
        console.error('❌ Upstash Redis Initialized Failed:', err.message);
        redisClient = null;
    }

    return redisClient;
};

const getRedisClient = () => redisClient;

// Cached response middleware for Express using Upstash REST
const cachedResponse = (ttlSeconds = 300) => async (req, res, next) => {
    if (!redisClient) return next();

    const isVercel = process.env.VERCEL === '1';
    // Skip caching completely on Vercel dev env or if specifically requested
    if (req.query.nocache === 'true') {
        return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
        // Fast fail timeout for serverless (Upstash usually replies in < 50ms)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const cachedData = await redisClient.get(key);
        clearTimeout(timeoutId);

        if (cachedData) {
            console.log(`[Cache Hit - Upstash REST] ${key}`);
            return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
        }
        
        console.log(`[Cache Miss] ${key}`);
        
        // Override res.json to cache the response before sending
        const originalJson = res.json;
        res.json = function(data) {
            // Restore original res.json to prevent infinite loops
            res.json = originalJson;
            
            // Background cache save (don't await it so we respond to user faster)
            try {
                redisClient.setex(key, ttlSeconds, JSON.stringify(data)).catch(err => {
                    console.error(`[Redis SET Error] Background save failed for ${key}:`, err.message);
                });
            } catch (err) {
                console.error(`[Redis Save Sync Error]`, err.message);
            }

            return originalJson.call(this, data);
        };

        next();
    } catch (err) {
        console.warn(`[Redis GET Error] Fallback to DB. Error:`, err.message);
        // Fallback to database if Redis fails
        next();
    }
};

module.exports = { initRedis, getRedisClient, cachedResponse };

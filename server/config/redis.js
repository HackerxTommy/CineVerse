const redis = require('redis');

let redisClient;
let isRedisConnected = false;

const initRedis = async () => {
    const redisUrl = process.env.REDIS_URL;

    // Fast fail if no REDIS_URL provided (e.g. local dev without Redis)
    if (!redisUrl) {
        console.log('⚠️  REDIS_URL not provided - API caching will be disabled.');
        return;
    }

    try {
        console.log('🔄 Initializing Redis connection...');
        redisClient = redis.createClient({ 
            url: redisUrl,
            socket: {
                connectTimeout: 5000 // 5 second timeout for Vercel
            }
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err.message);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis');
            isRedisConnected = true;
        });

        redisClient.on('ready', () => {
            console.log('✓ Redis Client Ready');
            isRedisConnected = true;
        });

        redisClient.on('end', () => {
            console.log('ℹ️ Redis connection closed');
            isRedisConnected = false;
        });

        await redisClient.connect();
    } catch (error) {
        console.error('❌ Failed to initialize Redis:', error.message);
        isRedisConnected = false;
    }
};

const getRedisClient = () => isRedisConnected ? redisClient : null;

module.exports = { initRedis, getRedisClient };

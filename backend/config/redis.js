const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('❌ Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('❌ Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('❌ Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('⚠️ Redis Client Disconnected');
    });

    await redisClient.connect();

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    // Don't exit process for Redis failure, app can work without caching
  }
};

const getRedisClient = () => {
  return redisClient;
};

const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (!redisClient) return false;
    await redisClient.setEx(key, expireTime, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (!redisClient) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient) return false;
    
    // If key contains wildcard, use pattern matching
    if (key.includes('*')) {
      const keys = await redisClient.keys(key);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Cleared ${keys.length} cache keys matching pattern: ${key}`);
      }
      return true;
    }
    
    // Single key deletion
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async () => {
  try {
    if (!redisClient) return false;
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('Redis clear error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache
}; 
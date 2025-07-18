#!/usr/bin/env node

/**
 * Development script to clear rate limiting
 * Run this if you get rate limited during development
 */

const redis = require('redis');

async function clearRateLimit() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    
    // Clear all rate limit keys
    const keys = await client.keys('rl:*');
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`✅ Cleared ${keys.length} rate limit entries`);
    } else {
      console.log('✅ No rate limit entries found');
    }
    
    console.log('🎉 Rate limiting cleared! You can now login again.');
  } catch (error) {
    console.error('❌ Error clearing rate limit:', error.message);
  } finally {
    await client.quit();
  }
}

clearRateLimit(); 
require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

const CACHE_TTL = 60 * 60; // 1 hour

const get = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttl = CACHE_TTL) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // silently fail
  }
};

const del = async (...keys) => {
  try {
    await redis.del(...keys);
  } catch {
    // silently fail
  }
};

module.exports = { get, set, del };

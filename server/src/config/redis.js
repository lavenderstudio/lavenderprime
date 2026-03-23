// server/config/redis.js
const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL không tồn tại → chạy mode không cache');
    return null;
  }

  redisClient = new Redis(redisUrl, {
    // Tùy chọn reconnect nếu mất kết nối (Railway khuyến nghị)
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 5,
  });

  redisClient.on('connect', () => console.log('✅ Redis kết nối thành công'));
  redisClient.on('error', (err) => console.error('❌ Redis lỗi:', err));

  return redisClient;
};

module.exports = connectRedis;

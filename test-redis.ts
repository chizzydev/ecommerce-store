// test-redis.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL!);

redis.ping()
  .then(() => {
    console.log('✅ Redis connected!');
    redis.quit();
  })
  .catch(err => {
    console.error('❌ Redis error:', err);
    redis.quit();
  });


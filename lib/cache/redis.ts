import Redis from "ioredis"

declare global {
  var redis: Redis | undefined | null
}

let redisClient: Redis | null = null

try {
  if (process.env.REDIS_URL) {
    redisClient =
      global.redis ??
      new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1, // Fail fast
        connectTimeout: 3000,
        lazyConnect: true,
        retryStrategy: () => null, // Don't retry on failure
      })

    if (process.env.NODE_ENV !== "production") {
      global.redis = redisClient
    }
  } else {
    console.warn('REDIS_URL not set, running without cache')
  }
} catch (error) {
  console.warn('Redis connection failed, running without cache:', error)
  redisClient = null
}

export const redis = redisClient

// ---------- Safe cache helper with fallback ----------
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // No Redis? Just fetch directly
  if (!redis) {
    return fetcher()
  }

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.warn('Redis get failed, fetching fresh:', error)
  }

  const fresh = await fetcher()

  // Try to cache, but don't fail if Redis is down
  try {
    await redis.setex(key, ttl, JSON.stringify(fresh))
  } catch (error) {
    console.warn('Redis set failed, continuing without cache:', error)
  }

  return fresh
}

// Safe delete helper
export async function deleteCacheKeys(...keys: string[]): Promise<void> {
  if (!redis) return

  try {
    await Promise.all(keys.map(key => redis!.del(key)))
  } catch (error) {
    console.warn('Redis delete failed:', error)
  }
}
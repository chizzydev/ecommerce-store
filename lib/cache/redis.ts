import Redis from "ioredis"

declare global {
  var redis: Redis | undefined
}

let redisClient: Redis | null = null

try {
  if (process.env.REDIS_URL) {
    redisClient =
      global.redis ??
      new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1, // Fail fast
        connectTimeout: 5000, // 5 second timeout
        lazyConnect: true,
      })

    if (process.env.NODE_ENV !== "production") {
      global.redis = redisClient
    }
  }
} catch (error) {
  console.warn('Redis connection failed, running without cache:', error)
  redisClient = null
}

export const redis = redisClient

// Helper function with fallback
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  if (!redis) {
    // No Redis, just fetch directly
    return fetcher()
  }

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.warn('Redis get failed, fetching fresh data:', error)
  }

  const fresh = await fetcher()

  try {
    await redis.setex(key, ttl, JSON.stringify(fresh))
  } catch (error) {
    console.warn('Redis set failed, continuing without cache:', error)
  }

  return fresh
}

// Helper to safely delete cache
export async function deleteCache(key: string | string[]) {
  if (!redis) return

  try {
    if (Array.isArray(key)) {
      await Promise.all(key.map(k => redis!.del(k)))
    } else {
      await redis.del(key)
    }
  } catch (error) {
    console.warn('Redis delete failed:', error)
  }
}
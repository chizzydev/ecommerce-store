import Redis from "ioredis"

declare global {
  var redis: Redis | undefined
}

const redisClient =
  global.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  })

if (process.env.NODE_ENV !== "production") {
  global.redis = redisClient
}

export const redis = redisClient

// ---------- Cache helper ----------
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key)

  if (cached) {
    return JSON.parse(cached)
  }

  const fresh = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(fresh))

  return fresh
}

import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'

const CACHE_TTL = 600 // 10 minutes

export async function getCategories() {
  const cacheKey = 'categories:all'

  // Try Redis first (only if available)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (error) {
      console.error('Redis error (getCategories):', error)
    }
  }

  // Fetch from database
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Cache result if Redis exists
  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categories))
    } catch (error) {
      console.error('Redis cache error (getCategories):', error)
    }
  }

  return categories
}

export async function getCategoryBySlug(slug: string) {
  const cacheKey = `category:slug:${slug}`

  // Try Redis first (only if available)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (error) {
      console.error('Redis error (getCategoryBySlug):', error)
    }
  }

  // Fetch from database
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  // Cache only if found and Redis exists
  if (category && redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(category))
    } catch (error) {
      console.error('Redis cache error (getCategoryBySlug):', error)
    }
  }

  return category
}
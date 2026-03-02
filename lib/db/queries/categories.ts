import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'

const CACHE_TTL = 600 // 10 minutes

export async function getCategories() {
  const cacheKey = 'categories:all'
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categories))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return categories
}

export async function getCategoryBySlug(slug: string) {
  const cacheKey = `category:slug:${slug}`
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  if (category) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(category))
    } catch (error) {
      console.error('Redis cache error:', error)
    }
  }

  return category
}
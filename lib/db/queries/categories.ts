import { prisma } from '@/lib/db/prisma'
import { getCached } from '@/lib/cache/redis'

const CACHE_TTL = 3600 // 1 hour

export async function getCategories() {
  return getCached(
    'categories:all',
    async () => {
      return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      })
    },
    CACHE_TTL
  )
}

export async function getCategoryBySlug(slug: string) {
  return getCached(
    `category:slug:${slug}`,
    async () => {
      return prisma.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { products: true },
          },
        },
      })
    },
    CACHE_TTL
  )
}
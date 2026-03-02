import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'

const CACHE_TTL = 300 // 5 minutes

// Safe cache wrapper
async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // If Redis is not available or not connected, skip caching
  if (!redis || redis.status !== 'ready') {
    return fetcher()
  }

  try {
    const cached = await redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.warn('Redis GET skipped:', error)
  }

  // Fetch fresh data
  const fresh = await fetcher()

  try {
    if (redis.status === 'ready') {
      await redis.setex(key, CACHE_TTL, JSON.stringify(fresh))
    }
  } catch (error) {
    console.warn('Redis SET skipped:', error)
  }

  return fresh
}

export async function getProducts() {
  return getCached('products:all', async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }))
  })
}

export async function getProductById(id: string) {
  return getCached(`product:${id}`, async () => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return null

    return {
      ...product,
      price: product.price.toNumber(),
    }
  })
}

export async function getProductBySlug(slug: string) {
  return getCached(`product:slug:${slug}`, async () => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return null

    return {
      ...product,
      price: product.price.toNumber(),
    }
  })
}

export async function getProductsByCategory(categoryId: string) {
  return getCached(`products:category:${categoryId}`, async () => {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }))
  })
}

export async function getFeaturedProducts() {
  return getCached('products:featured', async () => {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    })

    return products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }))
  })
}

export async function searchProducts(params: {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest'
}) {
  const { query, categoryId, minPrice, maxPrice, sortBy = 'newest' } = params

  const where: any = {
    isActive: true,
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) {
      where.price.gte = minPrice
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice
    }
  }

  let orderBy: any = { createdAt: 'desc' }
  switch (sortBy) {
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'name-asc':
      orderBy = { name: 'asc' }
      break
    case 'name-desc':
      orderBy = { name: 'desc' }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy,
  })

  return products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))
}
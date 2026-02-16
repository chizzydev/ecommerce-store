import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'

const CACHE_TTL = 300 // 5 minutes

export async function getProducts() {
  const cacheKey = 'products:all'
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  // Convert Decimal to number for client components
  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(serialized))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return serialized
}

export async function getProductById(id: string) {
  const cacheKey = `product:${id}`
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  // Convert Decimal to number
  const serialized = {
    ...product,
    price: product.price.toNumber(),
  }

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(serialized))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return serialized
}

export async function getProductBySlug(slug: string) {
  const cacheKey = `product:slug:${slug}`
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  // Convert Decimal to number
  const serialized = {
    ...product,
    price: product.price.toNumber(),
  }

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(serialized))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return serialized
}

export async function getProductsByCategory(categoryId: string) {
  const cacheKey = `products:category:${categoryId}`
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  // Convert Decimal to number
  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(serialized))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return serialized
}

export async function getFeaturedProducts() {
  const cacheKey = 'products:featured'
  
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    console.error('Redis error:', error)
  }

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

  // Convert Decimal to number
  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(serialized))
  } catch (error) {
    console.error('Redis cache error:', error)
  }

  return serialized
}

// Add this function to the END of lib/db/queries/products.ts

export async function searchProducts(params: {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest'
}) {
  const { query, categoryId, minPrice, maxPrice, sortBy = 'newest' } = params

  // Build where clause
  const where: any = {
    isActive: true,
  }

  // Search by name or description
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Filter by category
  if (categoryId) {
    where.categoryId = categoryId
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) {
      where.price.gte = minPrice
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice
    }
  }

  // Build orderBy clause
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

  // Convert Decimal to number
  return products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))
}
import { prisma } from '@/lib/db/prisma'
import { getCached } from '@/lib/cache/redis'

const CACHE_TTL = 3600

export async function getProducts() {
  return getCached(
    'products:all',
    async () => {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      })
      return products.map(serializeProduct)
    },
    CACHE_TTL
  )
}

export async function getFeaturedProducts() {
  return getCached(
    'products:featured',
    async () => {
      const products = await prisma.product.findMany({
        where: { 
          isActive: true,
          isFeatured: true,
        },
        include: { category: true },
        take: 8,
      })
      return products.map(serializeProduct)
    },
    CACHE_TTL
  )
}

export async function getProductsByCategory(categoryId: string) {
  return getCached(
    `products:category:${categoryId}`,
    async () => {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          categoryId,
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      })
      return products.map(serializeProduct)
    },
    CACHE_TTL
  )
}

export async function getProductBySlug(slug: string) {
  return getCached(
    `product:slug:${slug}`,
    async () => {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          reviews: {
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
      return product ? serializeProduct(product) : null
    },
    CACHE_TTL
  )
}

function serializeProduct(product: any) {
  return {
    ...product,
    price: product.price.toString(),
  }
}

// Search products
export async function searchProducts(params: {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
}) {
  const { query, categoryId, minPrice, maxPrice, sortBy } = params

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
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'price-asc') orderBy = { price: 'asc' }
  if (sortBy === 'price-desc') orderBy = { price: 'desc' }
  if (sortBy === 'name') orderBy = { name: 'asc' }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
  })

  return products.map(serializeProduct)
}
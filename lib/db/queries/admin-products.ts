import { prisma } from '@/lib/db/prisma'
import { deleteCacheKeys } from '@/lib/cache/redis'

export async function createProduct(data: {
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  sku: string | null
  images: string[]
  thumbnail: string | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
}) {
  const product = await prisma.product.create({
    data,
  })

  // Invalidate cache (safe - won't fail if Redis is down)
  await deleteCacheKeys(
    'products:all',
    'products:featured',
    `products:category:${data.categoryId}`
  )

  return product
}

export async function updateProduct(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string | null
    price?: number
    stock?: number
    sku?: string | null
    images?: string[]
    thumbnail?: string | null
    categoryId?: string
    isActive?: boolean
    isFeatured?: boolean
  }
) {
  const product = await prisma.product.update({
    where: { id },
    data,
  })

  // Invalidate cache
  await deleteCacheKeys(
    'products:all',
    'products:featured',
    `product:${id}`,
    `product:slug:${product.slug}`,
    `products:category:${product.categoryId}`
  )

  return product
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({
    where: { id },
  })

  // Invalidate cache
  await deleteCacheKeys(
    'products:all',
    'products:featured',
    `product:${id}`,
    `product:slug:${product.slug}`,
    `products:category:${product.categoryId}`
  )

  return product
}

export async function getAllProductsAdmin() {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
  }))
}

export async function getProductByIdAdmin(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  })

  if (!product) return null

  return {
    ...product,
    price: product.price.toNumber(),
  }
}
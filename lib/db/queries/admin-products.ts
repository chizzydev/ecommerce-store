import { prisma } from '@/lib/db/prisma'
import { deleteCache } from '@/lib/cache/redis'

// Get all products for admin
export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Get single product by ID for admin
export async function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// Create product
export async function createProduct(data: any) {
  const product = await prisma.product.create({
    data,
    include: {
      category: true,
    },
  })

  // Invalidate cache
  await deleteCache([
    'products:all',
    'products:featured',
    `products:category:${data.categoryId}`,
  ])

  return product
}

// Update product
export async function updateProduct(id: string, data: any) {
  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  })

  // Invalidate cache
  await deleteCache([
    'products:all',
    'products:featured',
    `product:${id}`,
    `product:slug:${product.slug}`,
    `products:category:${product.categoryId}`,
  ])

  return updated
}

// Delete product
export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  await prisma.product.delete({
    where: { id },
  })

  // Invalidate cache
  await deleteCache([
    'products:all',
    'products:featured',
    `product:${id}`,
    `product:slug:${product.slug}`,
    `products:category:${product.categoryId}`,
  ])
}
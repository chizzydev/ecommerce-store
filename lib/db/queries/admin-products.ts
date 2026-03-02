import { prisma } from '@/lib/db/prisma'
import { deleteCache } from '@/lib/cache/redis'

// Get all products for admin
export async function getAllProductsAdmin() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Convert Decimal to number
  return products.map(product => ({
    ...product,
    price: Number(product.price),
  }))
}

// Get single product by ID for admin
export async function getProductByIdAdmin(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!product) return null

  // Convert Decimal to number for form compatibility
  return {
    ...product,
    price: Number(product.price),
  }
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

  return {
    ...product,
    price: Number(product.price),
  }
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

  return {
    ...updated,
    price: Number(updated.price),
  }
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
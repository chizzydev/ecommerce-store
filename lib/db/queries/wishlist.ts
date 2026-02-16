import { prisma } from '@/lib/db/prisma'

export async function getUserWishlist(userId: string) {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return wishlistItems.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: item.product.price.toNumber(),
    },
  }))
}

export async function checkInWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  })

  return !!item
}
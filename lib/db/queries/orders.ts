import { prisma } from '@/lib/db/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function createOrder(data: {
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    productName: string
    productImage: string | null
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: {
    name: string
    email: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}) {
  return await prisma.order.create({
    data: {
      userId: data.userId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      shippingName: data.shippingAddress.name,
      shippingEmail: data.shippingAddress.email,
      shippingAddress: data.shippingAddress.address,
      shippingCity: data.shippingAddress.city,
      shippingState: data.shippingAddress.state,
      shippingZip: data.shippingAddress.zip,
      shippingCountry: data.shippingAddress.country,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          productImage: item.productImage,
        })),
      },
    },
    include: {
      items: true,
    },
  })
}

export async function updateOrderPayment(
  orderId: string,
  sessionId: string,
  paymentIntentId: string
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId || undefined,
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.PROCESSING,
    },
  })
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Convert Decimal to number
  return orders.map((order) => ({
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    shipping: order.shipping.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }))
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      },
    },
  })

  if (!order) return null

  // Convert Decimal to number
  return {
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    shipping: order.shipping.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }
}

export async function getOrderBySessionId(sessionId: string) {
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: true,
    },
  })

  if (!order) return null

  return {
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    shipping: order.shipping.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }
}
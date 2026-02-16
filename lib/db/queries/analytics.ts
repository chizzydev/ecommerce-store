import { prisma } from '@/lib/db/prisma'
import { startOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns'

export async function getRevenueByDay(days: number = 30) {
  const startDate = startOfDay(subDays(new Date(), days))

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
  })

  // Group by day
  const revenueByDay: Record<string, number> = {}
  
  orders.forEach((order) => {
    const date = startOfDay(order.createdAt).toISOString().split('T')[0]
    const amount = order.total.toNumber()
    
    if (revenueByDay[date]) {
      revenueByDay[date] += amount
    } else {
      revenueByDay[date] = amount
    }
  })

  // Convert to array format for charts
  return Object.entries(revenueByDay)
    .map(([date, revenue]) => ({
      date,
      revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTopProducts(limit: number = 10) {
  const products = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: {
      quantity: true,
    },
    _count: {
      productId: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: limit,
  })

  return products.map((p) => ({
    productId: p.productId,
    productName: p.productName,
    quantitySold: p._sum.quantity || 0,
    orderCount: p._count.productId,
  }))
}

export async function getSalesStats() {
  const today = startOfDay(new Date())
  const thisWeek = startOfWeek(new Date())
  const thisMonth = startOfMonth(new Date())

  const [todayStats, weekStats, monthStats, allTimeStats] = await Promise.all([
    // Today
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: today },
      },
      _count: true,
      _sum: { total: true },
    }),
    // This week
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thisWeek },
      },
      _count: true,
      _sum: { total: true },
    }),
    // This month
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thisMonth },
      },
      _count: true,
      _sum: { total: true },
    }),
    // All time
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _count: true,
      _sum: { total: true },
    }),
  ])

  return {
    today: {
      orders: todayStats._count,
      revenue: todayStats._sum.total?.toNumber() || 0,
    },
    week: {
      orders: weekStats._count,
      revenue: weekStats._sum.total?.toNumber() || 0,
    },
    month: {
      orders: monthStats._count,
      revenue: monthStats._sum.total?.toNumber() || 0,
    },
    allTime: {
      orders: allTimeStats._count,
      revenue: allTimeStats._sum.total?.toNumber() || 0,
    },
  }
}

export async function getOrderStatusBreakdown() {
  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })

  return statusCounts.map((s) => ({
    status: s.status,
    count: s._count,
  }))
}

export async function getRecentCustomers(limit: number = 10) {
  const customers = await prisma.user.findMany({
    where: {
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  return customers
}
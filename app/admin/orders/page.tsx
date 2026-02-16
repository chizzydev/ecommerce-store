import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { OrdersTable } from '@/components/admin/OrdersTable'

export const metadata = {
  title: 'Manage Orders',
  description: 'View and manage all orders',
}

export default async function AdminOrdersPage() {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Convert Decimal to number
  const serializedOrders = orders.map((order) => ({
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    shipping: order.shipping.toNumber(),
    total: order.total.toNumber(),
  }))

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
      <OrdersTable orders={serializedOrders} />
    </div>
  )
}
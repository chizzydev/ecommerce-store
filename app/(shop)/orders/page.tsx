import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserOrders } from '@/lib/db/queries/orders'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const metadata = {
  title: 'My Orders',
  description: 'View your order history',
}

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/orders')
  }

  const orders = await getUserOrders(user.id)

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-muted-foreground mb-8">You haven&apos;t placed any orders yet</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-medium">Order #{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(order.total)}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                  <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.productImage || '/placeholder.png'}
                      alt={item.productName}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <Button variant="outline" asChild>
              <Link href={`/orders/${order.id}`}>View Details</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
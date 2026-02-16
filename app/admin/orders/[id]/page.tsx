import { notFound, redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { getOrderById } from '@/lib/db/queries/orders'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/orders">← Back to Orders</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-muted-foreground">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                >
                  {order.status}
                </Badge>
                <Badge
                  variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Items */}
            <div className="mb-6">
              <h2 className="font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
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
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: {formatPrice(item.price)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Update Order</h2>
            <OrderStatusForm order={order} />
          </div>

          {/* Shipping Info */}
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shippingName}</p>
              <p>{order.shippingEmail}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Payment Details</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.stripePaymentIntentId && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Payment Intent
                  </p>
                  <p className="font-mono text-xs break-all">
                    {order.stripePaymentIntentId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
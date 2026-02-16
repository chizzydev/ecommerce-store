import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getOrderById } from '@/lib/db/queries/orders'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    return { title: 'Order Not Found' }
  }

  return {
    title: `Order #${order.orderNumber}`,
    description: 'Order details',
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const order = await getOrderById(id)

  if (!order || order.userId !== user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/orders">← Back to Orders</Link>
          </Button>
        </div>

        <div className="border rounded-lg p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
              <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
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
          <div className="space-y-2 mb-6">
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
              <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Shipping Address */}
          <div>
            <h2 className="font-semibold mb-2">Shipping Address</h2>
            <div className="text-muted-foreground">
              <p>{order.shippingName}</p>
              <p>{order.shippingEmail}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {order.trackingNumber && (
            <>
              <Separator className="my-6" />
              <div>
                <h2 className="font-semibold mb-2">Tracking Number</h2>
                <p className="text-muted-foreground">{order.trackingNumber}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
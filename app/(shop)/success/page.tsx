import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getOrderBySessionId } from '@/lib/db/queries/orders'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export const metadata = {
  title: 'Order Successful',
  description: 'Your order has been placed',
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/')
  }

  const order = await getOrderBySessionId(sessionId)

  if (!order) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Order Number:</span>
              <span>{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{order.status.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href={`/orders/${order.id}`}>View Order</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
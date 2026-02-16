'use client'

import { useCart } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface CartSummaryProps {
  hideCheckout?: boolean
}

export function CartSummary({ hideCheckout = false }: CartSummaryProps) {
  const items = useCart((state) => state.items)
  const total = useCart((state) => state.total())

  const subtotal = total
  const tax = total * 0.1
  const shipping = total > 50 ? 0 : 5.99
  const finalTotal = subtotal + tax + shipping

  if (items.length === 0) {
    return null
  }

  return (
    <div className="border rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {!hideCheckout && (
        <>
          <Button className="w-full mt-6" size="lg" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          <Button variant="outline" className="w-full mt-2" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>

          {total < 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Add {formatPrice(50 - total)} more for free shipping!
            </p>
          )}
        </>
      )}
    </div>
  )
}
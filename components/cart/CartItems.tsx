'use client'

import { useCart } from '@/store/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'

export function CartItems() {
  const items = useCart((state) => state.items)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const removeItem = useCart((state) => state.removeItem)

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 border rounded-lg p-4">
          <Link href={`/products/${item.slug}`} className="relative h-24 w-24 flex-shrink-0">
            <Image
              src={item.thumbnail || '/placeholder.png'}
              alt={item.name}
              fill
              className="object-cover rounded"
            />
          </Link>

          <div className="flex-1">
            <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
              {item.name}
            </Link>
            <p className="text-muted-foreground">{formatPrice(item.price)}</p>

            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-auto text-red-600"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
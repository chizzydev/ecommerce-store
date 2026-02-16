'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/store/cart-store'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    thumbnail: string | null
    stock: number
    category: {
      name: string
      slug: string
    }
  }
}

interface WishlistItemsProps {
  items: WishlistItem[]
}

export function WishlistItems({ items }: WishlistItemsProps) {
  const router = useRouter()
  const addToCart = useCart((state) => state.addItem)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleRemove(productId: string) {
    setRemovingId(productId)

    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      toast.success('Removed from wishlist')
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  function handleAddToCart(item: WishlistItem) {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      thumbnail: item.product.thumbnail,
    })
    toast.success('Added to cart')
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 relative">
          <Link href={`/products/${item.product.slug}`}>
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-4">
              <Image
                src={item.product.thumbnail || '/placeholder.png'}
                alt={item.product.name}
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          <div className="space-y-2">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-medium hover:underline line-clamp-2"
            >
              {item.product.name}
            </Link>

            <Link
              href={`/products/category/${item.product.category.slug}`}
              className="text-sm text-muted-foreground hover:underline block"
            >
              {item.product.category.name}
            </Link>

            <p className="text-lg font-bold">{formatPrice(item.product.price)}</p>

            {item.product.stock === 0 ? (
              <Badge variant="secondary" className="w-full justify-center">
                Out of Stock
              </Badge>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.product.id)}
                  disabled={removingId === item.product.id}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
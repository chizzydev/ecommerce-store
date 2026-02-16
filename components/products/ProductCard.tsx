'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/store/cart-store'
import { toast } from 'sonner'
import { WishlistButton } from './WishlistButton'
import { useCurrency } from '@/contexts/CurrencyContext'
import { convertPrice, formatPrice } from '@/lib/utils/currency'

interface ProductCardProps {
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
  inWishlist?: boolean
}

export function ProductCard({ product, inWishlist = false }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)
  const { currency } = useCurrency()
  const isOutOfStock = product.stock === 0

  // Convert price to user's currency
  const displayPrice = convertPrice(product.price, currency)
  const formattedPrice = formatPrice(displayPrice, currency)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      thumbnail: product.thumbnail,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.thumbnail || '/placeholder.png'}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Wishlist Button - Top Right */}
      <div className="absolute top-2 right-2">
        <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link
              href={`/products/${product.slug}`}
              className="font-medium hover:underline line-clamp-1"
            >
              {product.name}
            </Link>
            <Link
              href={`/products/category/${product.category.slug}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {product.category.name}
            </Link>
          </div>
          <p className="font-bold">{formattedPrice}</p>
        </div>

        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <Badge variant="secondary" className="w-full justify-center">
              Out of Stock
            </Badge>
          ) : (
            <Button size="sm" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
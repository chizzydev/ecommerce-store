'use client'

import { useState } from 'react'
import { useCart } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    thumbnail: string | null
  }
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    toast.success(`${product.name} added to cart`)
    
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled}
      className="w-full"
      size="lg"
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </Button>
  )
}
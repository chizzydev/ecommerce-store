'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart-store'
import Link from 'next/link'

export function CartButton() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCart((state) => state.itemCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {mounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
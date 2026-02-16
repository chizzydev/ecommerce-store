'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

interface WishlistButtonProps {
  productId: string
  initialInWishlist?: boolean
}

export function WishlistButton({ productId, initialInWishlist = false }: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function toggleWishlist() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/wishlist', {
        method: inWishlist ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login to save items to wishlist')
          router.push('/login')
          return
        }
        throw new Error(result.error || 'Failed to update wishlist')
      }

      setInWishlist(!inWishlist)
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Heart className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleWishlist}
      disabled={isLoading}
      className="relative"
    >
      <Heart
        className={`h-5 w-5 ${
          inWishlist ? 'fill-red-500 text-red-500' : ''
        }`}
      />
    </Button>
  )
}
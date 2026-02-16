'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function ClearFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const hasFilters = 
    searchParams.has('q') ||
    searchParams.has('category') ||
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    (searchParams.has('sort') && searchParams.get('sort') !== 'newest')

  if (!hasFilters) return null

  const handleClear = () => {
    router.push('/products')
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClear}>
      <X className="mr-2 h-4 w-4" />
      Clear Filters
    </Button>
  )
}
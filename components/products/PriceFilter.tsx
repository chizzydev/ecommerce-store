'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' }, // Changed from ''
  { label: 'Under $25', value: '0-25' },
  { label: '$25 - $50', value: '25-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: '$100 - $200', value: '100-200' },
  { label: 'Over $200', value: '200-999999' },
]

export function PriceFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentMin = searchParams.get('minPrice')
  const currentMax = searchParams.get('maxPrice')
  const currentValue = currentMin && currentMax ? `${currentMin}-${currentMax}` : 'all'

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      const [min, max] = value.split('-')
      params.set('minPrice', min)
      params.set('maxPrice', max)
    } else {
      params.delete('minPrice')
      params.delete('maxPrice')
    }

    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      <Label>Price Range</Label>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select price range" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
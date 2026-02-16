'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/utils/currency'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency()

  if (isLoading) {
    return (
      <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-md" />
    )
  }

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
      <SelectTrigger className="w-32">
        <SelectValue>
          {SUPPORTED_CURRENCIES[currency].flag} {SUPPORTED_CURRENCIES[currency].code}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            {info.flag} {info.code} - {info.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
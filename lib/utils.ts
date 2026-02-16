import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SUPPORTED_CURRENCIES, CurrencyCode, convertPrice, formatPrice as formatCurrencyPrice } from '@/lib/utils/currency'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// For use in server components (with explicit currency)
export function formatPrice(price: number, currency: string = 'NGN') {
  const currencyInfo = SUPPORTED_CURRENCIES[currency as CurrencyCode]
  if (!currencyInfo) return `₦${price.toLocaleString()}`
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

// For use in components (with currency context)
export function useFormatPrice() {
  const { useCurrency } = require('@/contexts/CurrencyContext')
  const { currency } = useCurrency()

  return (priceInNaira: number) => {
    const convertedPrice = convertPrice(priceInNaira, currency)
    return formatCurrencyPrice(convertedPrice, currency)
  }
}
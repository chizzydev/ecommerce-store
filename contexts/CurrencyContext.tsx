'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CurrencyCode, detectCurrency, updateExchangeRates } from '@/lib/utils/currency'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('NGN')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Update exchange rates once per day
    const lastUpdate = localStorage.getItem('rates-last-update')
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    if (!lastUpdate || parseInt(lastUpdate) < oneDayAgo) {
      updateExchangeRates().then(() => {
        localStorage.setItem('rates-last-update', Date.now().toString())
        console.log('✅ Exchange rates updated')
      }).catch((error) => {
        console.error('Failed to update exchange rates:', error)
      })
    }

    // Check if user has manually selected a currency
    const savedCurrency = localStorage.getItem('preferred-currency') as CurrencyCode
    
    if (savedCurrency) {
      setCurrencyState(savedCurrency)
      setIsLoading(false)
      return
    }

    // Auto-detect based on IP location
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const detectedCurrency = detectCurrency(data.country_code)
        setCurrencyState(detectedCurrency)
        setIsLoading(false)
        console.log('🌍 Currency auto-detected:', detectedCurrency)
      })
      .catch(() => {
        // Fallback to Naira
        setCurrencyState('NGN')
        setIsLoading(false)
      })
  }, [])

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
    console.log('💱 Currency changed to:', newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
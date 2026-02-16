export const SUPPORTED_CURRENCIES = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    locale: 'en-NG',
    exchangeRate: 1, // Base currency
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    locale: 'en-US',
    exchangeRate: 0.00063, // 1 NGN = 0.00063 USD (approx 1580 NGN = 1 USD)
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    locale: 'en-GB',
    exchangeRate: 0.0005, // 1 NGN = 0.0005 GBP (approx 2000 NGN = 1 GBP)
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    locale: 'en-EU',
    exchangeRate: 0.00059, // 1 NGN = 0.00059 EUR (approx 1695 NGN = 1 EUR)
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    flag: '🇬🇭',
    locale: 'en-GH',
    exchangeRate: 0.0095, // 1 NGN = 0.0095 GHS (approx 105 NGN = 1 GHS)
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    locale: 'en-KE',
    exchangeRate: 0.082, // 1 NGN = 0.082 KES (approx 12 NGN = 1 KES)
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦',
    locale: 'en-ZA',
    exchangeRate: 0.012, // 1 NGN = 0.012 ZAR (approx 83 NGN = 1 ZAR)
  },
} // <-- REMOVED "as const" HERE

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  NG: 'NGN', // Nigeria
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  ES: 'EUR', // Spain
  IT: 'EUR', // Italy
  NL: 'EUR', // Netherlands
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
}

export function detectCurrency(countryCode?: string): CurrencyCode {
  if (!countryCode) return 'NGN' // Default to Naira
  return COUNTRY_CURRENCY_MAP[countryCode] || 'USD' // Default to USD for unknown countries
}

export function convertPrice(priceInNaira: number, targetCurrency: CurrencyCode): number {
  const rate = SUPPORTED_CURRENCIES[targetCurrency].exchangeRate
  return Math.round(priceInNaira * rate * 100) / 100 // Round to 2 decimals
}

export function formatPrice(price: number, currency: CurrencyCode): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function getFlutterwaveCurrency(currency: CurrencyCode): string {
  return currency
}

// Fetch live exchange rates from API
export async function getExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/NGN')
    const data = await response.json()
    return data.rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Return fallback rates
    return {
      USD: 0.00063,
      GBP: 0.0005,
      EUR: 0.00059,
      GHS: 0.0095,
      KES: 0.082,
      ZAR: 0.012,
    }
  }
}

// Update exchange rates (called automatically by CurrencyContext)
export async function updateExchangeRates() {
  const rates = await getExchangeRates()
  
  // Update the rates in SUPPORTED_CURRENCIES
  if (rates.USD) SUPPORTED_CURRENCIES.USD.exchangeRate = rates.USD
  if (rates.GBP) SUPPORTED_CURRENCIES.GBP.exchangeRate = rates.GBP
  if (rates.EUR) SUPPORTED_CURRENCIES.EUR.exchangeRate = rates.EUR
  if (rates.GHS) SUPPORTED_CURRENCIES.GHS.exchangeRate = rates.GHS
  if (rates.KES) SUPPORTED_CURRENCIES.KES.exchangeRate = rates.KES
  if (rates.ZAR) SUPPORTED_CURRENCIES.ZAR.exchangeRate = rates.ZAR
  
  console.log('✅ Exchange rates updated:', new Date().toISOString())
  return rates
}
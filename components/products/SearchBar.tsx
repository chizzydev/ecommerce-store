'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const initializedRef = useRef(false)

  // Update local state when URL changes (but not on mount)
  useEffect(() => {
    if (initializedRef.current) {
      const urlQuery = searchParams.get('q') || ''
      if (urlQuery !== query) {
        setQuery(urlQuery)
      }
    } else {
      initializedRef.current = true
    }
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (query) {
        params.set('q', query)
      } else {
        params.delete('q')
      }

      const newUrl = `/products?${params.toString()}`
      const currentUrl = `/products?${searchParams.toString()}`
      
      // Only navigate if URL actually changed
      if (newUrl !== currentUrl) {
        router.push(newUrl)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query]) // Only depend on query, not searchParams

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
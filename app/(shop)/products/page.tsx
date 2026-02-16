import { searchProducts } from '@/lib/db/queries/products'
import { getCategories } from '@/lib/db/queries/categories'
import { ProductGrid } from '@/components/products/ProductGrid'
import { SearchBar } from '@/components/products/SearchBar'
import { CategoryFilter } from '@/components/products/CategoryFilter'
import { PriceFilter } from '@/components/products/PriceFilter'
import { SortFilter } from '@/components/products/SortFilter'
import { ClearFilters } from '@/components/products/ClearFilters'
import { Suspense } from 'react'

export const metadata = {
  title: 'Products',
  description: 'Browse our product catalog',
}

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const categories = await getCategories()

  const products = await searchProducts({
    query: params.q,
    categoryId: params.category,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    sortBy: params.sort as any,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <ClearFilters />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBar />
          </Suspense>
          
          <CategoryFilter categories={categories} />
          <PriceFilter />
          <SortFilter />
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No products found matching your filters
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
              <ProductGrid products={products} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
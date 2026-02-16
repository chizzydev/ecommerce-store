import { getFeaturedProducts } from '@/lib/db/queries/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Our Store
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover amazing products at great prices
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">View All</Link>
          </Button>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  )
}
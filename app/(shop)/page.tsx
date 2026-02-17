import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts } from '@/lib/db/queries/products'
import { ProductCard } from '@/components/products/ProductCard'
import { getCurrentUser } from '@/lib/auth/session'
import { checkInWishlist } from '@/lib/db/queries/wishlist'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const products = await getFeaturedProducts()
  const user = await getCurrentUser()

  const productsWithWishlist = await Promise.all(
    products.map(async (product : any) => ({
      ...product,
      inWishlist: user ? await checkInWishlist(user.id, product.id) : false,
    }))
  )

  return (
    <div className="flex flex-col">
      {/* Hero Section - Mobile First */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-28 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Welcome to Our Store
          </h1>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Discover amazing products at great prices
          </p>
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8"
            asChild
          >
            <Link href="/products">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {productsWithWishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price: Number(product.price),
              }}
              inWishlist={product.inWishlist}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
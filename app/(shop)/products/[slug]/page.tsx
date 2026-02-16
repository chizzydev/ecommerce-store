import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/db/queries/products'
import { getCurrentUser } from '@/lib/auth/session'
import { checkInWishlist } from '@/lib/db/queries/wishlist'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { WishlistButton } from '@/components/products/WishlistButton'
import { Separator } from '@/components/ui/separator'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewSummary } from '@/components/reviews/ReviewSummary'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const user = await getCurrentUser()

  if (!product) {
    notFound()
  }

  const isOutOfStock = product.stock === 0
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc: number, r) => acc + r.rating, 0) /
        product.reviews.length
      : 0

  const mainImage =
    product.thumbnail || product.images?.[0] || '/placeholder.png'

  // Check if user already reviewed
  const userReview = user
    ? product.reviews.find((r) => r.userId === user.id)
    : null

  // Check if in wishlist
  const inWishlist = user ? await checkInWishlist(user.id, product.id) : false

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((image: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square relative overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category?.name ?? 'Uncategorized'}
            </Badge>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold">
                {formatPrice(Number(product.price))}
              </p>

              {!isOutOfStock && (
                <Badge variant="secondary">{product.stock} in stock</Badge>
              )}

              {isOutOfStock && <Badge variant="destructive">Out of stock</Badge>}
            </div>
          </div>

          {product.description && (
            <>
              <Separator />
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Add to Cart + Wishlist */}
          <div className="flex gap-2">
            <div className="flex-1">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  thumbnail: product.thumbnail,
                }}
                disabled={isOutOfStock}
              />
            </div>
            <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
          </div>

          {/* Reviews Summary in Sidebar */}
          {product.reviews.length > 0 && (
            <>
              <Separator />
              <ReviewSummary
                reviews={product.reviews}
                totalReviews={product.reviews.length}
                averageRating={averageRating}
              />
            </>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Form - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {user ? (
              userReview ? (
                <div className="border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    ✅ You have already reviewed this product
                  </p>
                </div>
              ) : (
                <ReviewForm productId={product.id} productName={product.name} />
              )
            ) : (
              <div className="border rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please log in to write a review
                </p>
              </div>
            )}

            {/* Reviews List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
              <ReviewList reviews={product.reviews} />
            </div>
          </div>

          {/* Summary Sidebar - Right Side */}
          <div>
            {product.reviews.length > 0 && (
              <div className="sticky top-4">
                <ReviewSummary
                  reviews={product.reviews}
                  totalReviews={product.reviews.length}
                  averageRating={averageRating}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
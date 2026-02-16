import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserWishlist } from '@/lib/db/queries/wishlist'
import { WishlistItems } from '@/components/wishlist/WishlistItems'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'My Wishlist',
  description: 'Your saved items',
}

export default async function WishlistPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/wishlist')
  }

  const wishlistItems = await getUserWishlist(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <WishlistItems items={wishlistItems} />
      )}
    </div>
  )
}
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { CartButton } from '@/components/cart/CartButton'
import { UserMenu } from '@/components/auth/UserMenu'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { CurrencySelector } from '@/components/ui/CurrencySelector'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CurrencyProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              E-Commerce Store
            </Link>

            <nav className="flex items-center gap-4">
              <Link href="/products" className="hover:underline">
                Products
              </Link>
              <CurrencySelector />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <CartButton />
              <UserMenu />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 E-Commerce Store. All rights reserved.
          </div>
        </footer>
      </div>
    </CurrencyProvider>
  )
}
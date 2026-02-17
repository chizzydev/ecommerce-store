import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart } from 'lucide-react'
import { CartButton } from '@/components/cart/CartButton'
import { UserMenu } from '@/components/auth/UserMenu'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { CurrencySelector } from '@/components/ui/CurrencySelector'
//import { CrispChat } from '@/components/chat/CrispChat'
import { getCurrentUser } from '@/lib/auth/session'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CurrencyProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="font-bold text-base whitespace-nowrap shrink-0">
              E-Commerce
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 flex-1 justify-center">
              <Link href="/products" className="text-sm hover:underline">
                Products
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              {/* Currency - hidden on smallest screens */}
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>

              {/* Cart */}
              <CartButton />

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Bottom Bar - Products link + Currency */}
          <div className="sm:hidden border-t px-4 py-2 flex items-center justify-between">
            <Link href="/products" className="text-sm font-medium hover:underline">
              Products
            </Link>
            <CurrencySelector />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 E-Commerce Store. All rights reserved.
          </div>
        </footer>
      </div>

      {/* <CrispChat /> */}
    </CurrencyProvider>
  )
}
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import {
  Package,
  ShoppingCart,
  LayoutDashboard,
  Home,
  BarChart3,
  Star,
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check - redirect if not logged in or not admin
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Orders
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/products">
                <Package className="mr-2 h-4 w-4" />
                Products
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/reviews">
                <Star className="mr-2 h-4 w-4" />
                Reviews
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start mt-8" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Store
              </Link>
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
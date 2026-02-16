import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { getAllProductsAdmin } from '@/lib/db/queries/admin-products'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Manage Products',
  description: 'Manage your product catalog',
}

export default async function AdminProductsPage() {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const products = await getAllProductsAdmin()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
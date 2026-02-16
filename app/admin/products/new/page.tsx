import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Add Product',
  description: 'Add a new product',
}

export default async function NewProductPage() {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/products">← Back to Products</Link>
        </Button>
      </div>

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Add Product</h1>
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
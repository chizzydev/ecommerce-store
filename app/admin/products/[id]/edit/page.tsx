import { notFound, redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { getProductByIdAdmin } from '@/lib/db/queries/admin-products'
import { ProductForm } from '@/components/admin/ProductForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Product',
  description: 'Edit product details',
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const product = await getProductByIdAdmin(id)

  if (!product) {
    notFound()
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
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  )
}
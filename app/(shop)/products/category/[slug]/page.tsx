import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/db/queries/categories'
import { getProductsByCategory } from '@/lib/db/queries/products'
import { ProductGrid } from '@/components/products/ProductGrid'

interface CategoryPageProps {
  params: { slug: string } | Promise<{ slug: string }>
}

// --- Metadata for SEO ---
export async function generateMetadata({ params }: CategoryPageProps) {
  // unwrap params if it's a Promise
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    return { title: 'Category Not Found' }
  }

  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: category.name,
    description: category.description ?? undefined,
  }
}

// --- Main Category Page ---
export default async function CategoryPage({ params }: CategoryPageProps) {
  // unwrap params if it's a Promise
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    notFound()
  }

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(category.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {category._count.products} products
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  )
}

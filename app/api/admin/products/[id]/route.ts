import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { updateProduct, deleteProduct } from '@/lib/db/queries/admin-products'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0.01).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await req.json()
    const validatedData = updateProductSchema.parse(body)

    const product = await updateProduct(id, validatedData)

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    await deleteProduct(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
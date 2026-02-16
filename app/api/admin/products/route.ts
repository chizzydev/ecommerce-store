import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { createProduct } from '@/lib/db/queries/admin-products'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable(),
  price: z.number().min(0.01),
  stock: z.number().int().min(0),
  sku: z.string().nullable(),
  images: z.array(z.string()),
  thumbnail: z.string().nullable(),
  categoryId: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
})

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const validatedData = createProductSchema.parse(body)

    const product = await createProduct(validatedData)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
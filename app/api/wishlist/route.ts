import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const wishlistSchema = z.object({
  productId: z.string(),
})

// Add to wishlist
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { productId } = wishlistSchema.parse(body)

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already in wishlist' },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Wishlist add error:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// Remove from wishlist
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { productId } = wishlistSchema.parse(body)

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wishlist remove error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
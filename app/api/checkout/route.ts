import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { stripe } from '@/lib/payment/stripe'
import { createOrder } from '@/lib/db/queries/orders'
import { z } from 'zod'

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      thumbnail: z.string().nullable(),
    })
  ),
  shippingAddress: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string(),
    zip: z.string().min(3),
    country: z.string().default('US'),
  }),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = checkoutSchema.parse(body)

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.1
    const shipping = subtotal > 50 ? 0 : 5.99
    const total = subtotal + tax + shipping

    // Create order in database (status: PENDING)
    const order = await createOrder({
      userId: user.id,
      items: validatedData.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        productName: item.name,
        productImage: item.thumbnail,
      })),
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: validatedData.shippingAddress,
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: validatedData.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.thumbnail ? [item.thumbnail] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    })

    // Webhook will update order status when payment succeeds
    // Don't update order here - it causes duplicate session ID errors

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
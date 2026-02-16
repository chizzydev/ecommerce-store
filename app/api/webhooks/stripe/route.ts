import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/payment/stripe'
import { updateOrderPayment, getOrderById } from '@/lib/db/queries/orders'
import { sendOrderConfirmationEmail } from '@/lib/email/send'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId && session.payment_intent) {
        await updateOrderPayment(
          orderId,
          session.id,
          session.payment_intent as string
        )

        // Send confirmation email
        const order = await getOrderById(orderId)
        if (order) {
          await sendOrderConfirmationEmail(order)
        }
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
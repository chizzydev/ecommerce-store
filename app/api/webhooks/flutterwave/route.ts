import { NextResponse } from 'next/server'
import { updateOrderPayment } from '@/lib/db/queries/orders'
import { sendOrderConfirmationEmail } from '@/lib/email/send'
import { getOrderById } from '@/lib/db/queries/orders'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
    const signature = req.headers.get('verif-hash')

    if (!signature || signature !== secretHash) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Handle successful payment
    if (body.event === 'charge.completed' && body.data.status === 'successful') {
      const orderId = body.data.tx_ref // This is our order ID
      const transactionId = body.data.id.toString()
      const flwRef = body.data.flw_ref

      // Update order
      await updateOrderPayment(orderId, flwRef, transactionId)

      // Send confirmation email
      const order = await getOrderById(orderId)
      if (order) {
        // @ts-ignore
        await sendOrderConfirmationEmail(order)
      }

      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'ignored' })
  } catch (error) {
    console.error('Flutterwave webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { verifyFlutterwaveTransaction } from '@/lib/payment/flutterwave'
import { updateOrderPayment, getOrderById } from '@/lib/db/queries/orders'
import { sendOrderConfirmationEmail } from '@/lib/email/send'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const txRef = searchParams.get('tx_ref')
    const transactionId = searchParams.get('transaction_id')

    if (status === 'successful' && transactionId) {
      // Verify transaction
      const response = await verifyFlutterwaveTransaction(transactionId)

      if (
        response.data.status === 'successful' &&
        response.data.currency === 'NGN'
      ) {
        const orderId = response.data.tx_ref

        await updateOrderPayment(
          orderId,
          response.data.flw_ref,
          transactionId
        )

        // Send email
        const order = await getOrderById(orderId)
        if (order) {
          await sendOrderConfirmationEmail(order)
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id=${orderId}`
        )
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=payment_failed`
    )
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=verification_failed`
    )
  }
}
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from './resend'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import ShippingNotificationEmail from '@/emails/ShippingNotification'
import { formatPrice, formatDate } from '@/lib/utils'
import { PasswordResetEmail } from './templates/password-reset'
import { render } from '@react-email/render'

interface Order {
  orderNumber: string
  total: number
  createdAt: Date
  shippingName: string
  shippingEmail: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}

export async function sendOrderConfirmationEmail(order: Order) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.shippingEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Order Confirmation - ${order.orderNumber}`,
      react: OrderConfirmationEmail({
        customerName: order.shippingName,
        orderNumber: order.orderNumber,
        orderDate: formatDate(order.createdAt),
        orderTotal: formatPrice(order.total),
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: formatPrice(item.price),
        })),
        shippingAddress: {
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          zip: order.shippingZip,
          country: order.shippingCountry,
        },
      }),
    })

    console.log('Order confirmation email sent:', order.orderNumber)
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    // Don't throw - email failure shouldn't break the order flow
  }
}

export async function sendShippingNotificationEmail(
  order: {
    orderNumber: string
    shippingName: string
    shippingEmail: string
    trackingNumber: string | null
  }
) {
  try {
    if (!order.trackingNumber) {
      console.log('No tracking number, skipping shipping email')
      return
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.shippingEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Your order has shipped - ${order.orderNumber}`,
      react: ShippingNotificationEmail({
        customerName: order.shippingName,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
      }),
    })

    console.log('Shipping notification email sent:', order.orderNumber)
  } catch (error) {
    console.error('Failed to send shipping notification email:', error)
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
) {
  try {
    console.log('🔄 Rendering password reset email...')
    
    const emailHtml = await render(
      PasswordResetEmail({
        resetLink,
      })
    )

    console.log('✅ Email HTML rendered successfully')
    console.log('📧 Sending to:', email)
    console.log('🔑 Using FROM_EMAIL:', FROM_EMAIL)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Resend API error:', error)
      throw new Error(`Resend error: ${JSON.stringify(error)}`)
    }

    console.log('✅ Email sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Password reset email failed:', error)
    throw error
  }
}
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from './resend'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import ShippingNotificationEmail from '@/emails/ShippingNotification'
import { formatPrice, formatDate } from '@/lib/utils'

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
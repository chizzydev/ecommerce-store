import { NextResponse } from 'next/server'
import { render } from '@react-email/components'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'

export async function GET() {
  const html = await render(
    OrderConfirmationEmail({
      customerName: 'John Doe',
      orderNumber: 'ORD-12345',
      orderDate: 'January 15, 2024',
      orderTotal: '$299.97',
      items: [
        {
          name: 'Wireless Headphones',
          quantity: 1,
          price: '$299.99',
        },
      ],
      shippingAddress: {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US',
      },
    })
  )

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
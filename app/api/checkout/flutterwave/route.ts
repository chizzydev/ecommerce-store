import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { createFlutterwavePayment } from '@/lib/payment/flutterwave'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to checkout' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { shippingDetails, cartItems, currency } = body

    // Convert prices based on currency
    const actualCurrency = currency || 'NGN'

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.075 // 7.5% VAT
    const shipping = subtotal >= 50000 ? 0 : 2500
    const total = subtotal + tax + shipping

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: `ORD-${Date.now()}`,
        subtotal,
        tax,
        shipping,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingName: shippingDetails.name,
        shippingEmail: shippingDetails.email,
        shippingAddress: shippingDetails.address,
        shippingCity: shippingDetails.city,
        shippingState: shippingDetails.state,
        shippingZip: shippingDetails.zip,
        shippingCountry: 'NG',
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.thumbnail,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    // Create Flutterwave payment
    const payload = {
      tx_ref: order.id,
      amount: total,
      currency: actualCurrency,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flutterwave/verify`,
      payment_options: 'card,banktransfer,ussd,account',
      customer: {
        email: shippingDetails.email,
        name: shippingDetails.name,
        phonenumber: shippingDetails.phone || '',
      },
      customizations: {
        title: 'E-Commerce Store',
        description: `Order ${order.orderNumber}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
      meta: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currency: actualCurrency,
      },
    }

    const response = await createFlutterwavePayment(payload)

    return NextResponse.json({
      url: response.data.link,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Flutterwave checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
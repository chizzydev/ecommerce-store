import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { sendShippingNotificationEmail } from '@/lib/email/send'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().nullable().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await req.json()
    const validatedData = updateOrderSchema.parse(body)

    const order = await prisma.order.update({
      where: { id },
      data: validatedData,
    })

    // Send shipping notification if status changed to SHIPPED
    if (validatedData.status === 'SHIPPED' && validatedData.trackingNumber) {
      await sendShippingNotificationEmail({
        orderNumber: order.orderNumber,
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
        trackingNumber: order.trackingNumber,
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { CartSummary } from '@/components/cart/CartSummary'

export const metadata = {
  title: 'Checkout',
  description: 'Complete your purchase',
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/checkout')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
// No package needed - direct API calls

interface FlutterwavePaymentPayload {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  payment_options: string
  customer: {
    email: string
    name: string
    phonenumber?: string
  }
  customizations: {
    title: string
    description: string
    logo?: string
  }
  meta?: Record<string, any>
}

export async function createFlutterwavePayment(payload: FlutterwavePaymentPayload) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Flutterwave API error:', data) // SEE ACTUAL ERROR
    throw new Error(`Flutterwave error: ${JSON.stringify(data)}`)
  }

  return data
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('Flutterwave verify error:', data)
    throw new Error(`Verification failed: ${JSON.stringify(data)}`)
  }

  return data
}
import { NextResponse } from 'next/server'
import { generateResetToken } from '@/lib/auth/password-reset'
import { sendPasswordResetEmail } from '@/lib/email/send'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    try {
      const resetToken = await generateResetToken(email)
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

      await sendPasswordResetEmail(email, resetLink)

      return NextResponse.json({
        message: 'Password reset email sent',
      })
    } catch (error) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        message: 'If an account exists, a reset email has been sent',
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { resetPassword } from '@/lib/auth/password-reset'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await resetPassword(token, password)

    return NextResponse.json({
      message: 'Password reset successful',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    )
  }
}
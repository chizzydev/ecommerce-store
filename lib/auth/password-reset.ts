import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export async function generateResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Token expires in 1 hour
  const resetTokenExpiry = new Date(Date.now() + 3600000)

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry,
    },
  })

  return resetToken // Return unhashed token for email link
}

export async function verifyResetToken(token: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: {
        gt: new Date(), // Token not expired
      },
    },
  })

  if (!user) {
    throw new Error('Invalid or expired token')
  }

  return user
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await verifyResetToken(token)

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return user
}
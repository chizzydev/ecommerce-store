import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'orders@yourdomain.com' // Change this to your verified domain
export const REPLY_TO_EMAIL = 'support@yourdomain.com'
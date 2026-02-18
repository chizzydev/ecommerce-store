import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'

export async function AdminGuard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return null
}
import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  // Protect admin routes
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin', '/admin/:path*', '/orders/:path*',],
}


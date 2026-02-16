import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token') // or next-auth.session-token
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/orders/:path*'],
}

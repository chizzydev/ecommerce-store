import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Get NextAuth session token
  const token = req.cookies.get('next-auth.session-token') || 
                req.cookies.get('__Secure-next-auth.session-token')
  
  const isAdminPage = pathname.startsWith('/admin')

  // Protect admin routes
  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
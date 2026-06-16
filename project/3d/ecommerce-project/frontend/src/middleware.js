import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if ((pathname === '/' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard/products', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/register', '/dashboard/:path*'],
}

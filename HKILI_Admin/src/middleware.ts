import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value

  // Check if trying to access admin pages
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/login') {
      return NextResponse.next()
    }

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      // Check if user is admin
      if (payload.role !== 'admin') {
        // Redirect to unauthorized or home if not admin
        // For now redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}

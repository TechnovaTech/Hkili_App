import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Disable all auth checks - allow access to all admin pages
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin/login']
}
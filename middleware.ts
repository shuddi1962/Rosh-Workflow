import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Admin routes - check for token presence (verification happens in API routes)
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Just check if token exists - verification happens in API routes
    // Admin routes will verify the JWT in the actual route handler
  }
  
  // User routes - redirect if not authenticated
  if (pathname.startsWith('/dashboard') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'))) {
    const token = request.cookies.get('access_token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*', '/api/:path*']
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next()
  }
  
  if (pathname === '/api/health' || pathname.startsWith('/api/webhooks') || pathname.startsWith('/api/insforge-test')) {
    return NextResponse.next()
  }
  
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const payload = decodeJWT(token)
  
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

function decodeJWT(token: string): { userId: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*']
}

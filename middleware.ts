import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname === '/login' || pathname === '/register' || pathname === '/api/health' || pathname.startsWith('/api/webhooks')) {
    return NextResponse.next()
  }
  
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const payload = decodeToken(token)
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  if (pathname.startsWith('/dashboard') || 
      (pathname.startsWith('/api/') && 
       !pathname.startsWith('/api/auth'))) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const payload = decodeToken(token)
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

function decodeToken(token: string): { userId: string; email: string; role: string; name: string } | null {
  try {
    const jwt = require('jsonwebtoken')
    const secret = process.env.NEXTAUTH_SECRET
    return jwt.verify(token, secret) as { userId: string; email: string; role: string; name: string }
  } catch {
    return null
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*']
}

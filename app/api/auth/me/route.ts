import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || request.headers.get('cookie')?.match(/access_token=([^;]+)/)?.[1]
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    
    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}

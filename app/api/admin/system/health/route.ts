import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const dbTest = await db.query('SELECT 1')

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbTest.error ? 'disconnected' : 'connected',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(health)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'unhealthy', error: message }, { status: 500 })
  }
}

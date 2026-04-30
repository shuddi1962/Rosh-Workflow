import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `)
    
    if (error) {
      return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      connected: true, 
      message: 'Database connected successfully',
      url: process.env.DB_HOST,
      tables: data 
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ connected: false, error: message }, { status: 500 })
  }
}

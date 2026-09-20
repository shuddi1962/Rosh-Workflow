import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db.from('users').select('id').limit(5)

    if (error) {
      return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      connected: true,
      message: 'Supabase connected successfully',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: data
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ connected: false, error: message }, { status: 500 })
  }
}

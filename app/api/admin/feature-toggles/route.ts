import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('feature_toggles')
      .select('*')
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ toggles: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { feature_key, is_enabled, value } = await request.json()
    
    const { data, error } = await db
      .from('feature_toggles')
      .insert({ feature_key, is_enabled, value: value || {}, updated_by: 'admin', updated_at: new Date().toISOString() })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ toggle: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

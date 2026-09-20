import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('competitors')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ competitors: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, website, division } = await request.json()
    
    const { data, error } = await db
      .from('competitors')
      .insert({ name, website, division, active_ads: [], created_at: new Date().toISOString() })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ competitor: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

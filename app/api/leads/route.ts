import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'

export async function GET() {
  try {
    const { data, error } = await insforgeAdmin
      .database
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ leads: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await insforgeAdmin
      .database
      .from('leads')
      .insert([{ ...body, created_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ lead: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

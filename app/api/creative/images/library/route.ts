import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'

export async function GET() {
  try {
    const { data, error } = await insforgeAdmin
      .database
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ images: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

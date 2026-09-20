import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await db
      .from('social_posts')
      .insert({ ...body, created_at: new Date().toISOString() })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

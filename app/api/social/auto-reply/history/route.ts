import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const platform = searchParams.get('platform')

    let query = db.from('social_auto_replies').select('*').order('created_at', { ascending: false }).limit(limit)

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ history: [], total: 0 })

    const rows = data as Array<Record<string, unknown>>
    return NextResponse.json({ history: rows || [], total: rows?.length || 0 })
  } catch {
    return NextResponse.json({ history: [], total: 0 })
  }
}

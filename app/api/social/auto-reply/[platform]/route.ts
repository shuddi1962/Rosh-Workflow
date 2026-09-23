import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

// PUT /api/social/auto-reply/[platform] — enable/disable auto-reply per platform.
// Persisted in feature_toggles as auto_reply_<platform> so it survives reloads.
export async function PUT(request: Request, { params }: { params: { platform: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const platform = params.platform.toLowerCase()
    const body = (await request.json()) as Record<string, unknown>
    const isEnabled = Boolean(body.isEnabled ?? body.is_enabled ?? true)
    const key = `auto_reply_${platform}`

    const { data: existing } = await db.from('feature_toggles').select('*').eq('feature_key', key).single()
    if (existing) {
      const { data, error } = await db
        .from('feature_toggles')
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq('feature_key', key)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json({ platform, isEnabled, toggle: data })
    }
    const { data, error } = await db
      .from('feature_toggles')
      .insert({ feature_key: key, is_enabled: isEnabled, value: {}, updated_by: 'user', updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ platform, isEnabled, toggle: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const body = await request.json()
    const { enabled } = body
    const platform = params.platform

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    const existing = await db
      .from('feature_toggles')
      .select('*')
      .eq('feature_key', `auto_reply_${platform}`)
      .single()

    if (existing.data) {
      const { data, error } = await db
        .from('feature_toggles')
        .update({ is_enabled: enabled, updated_by: 'system', updated_at: new Date().toISOString() })
        .eq('feature_key', `auto_reply_${platform}`)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ platform, enabled, toggle: data })
    } else {
      const { data, error } = await db
        .from('feature_toggles')
        .insert({
          feature_key: `auto_reply_${platform}`,
          is_enabled: enabled,
          value: JSON.stringify({ platform }),
          updated_by: 'system',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ platform, enabled, toggle: data })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle platform'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

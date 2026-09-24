import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()
const KEYS = ['drive_public_links_enabled', 'drive_trash_retention_days', 'drive_payment_provider']

// GET /api/admin/storage/settings — drive platform settings
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const { data } = await db.from('feature_toggles').select('*').limit(200)
  const rows = ((data as unknown as Row[]) || []).filter((t) => KEYS.includes(String(t.feature_key)))
  const settings: Record<string, Row> = {}
  for (const k of KEYS) settings[k] = rows.find((t) => String(t.feature_key) === k) || { feature_key: k, is_enabled: false, value: {} }
  return NextResponse.json({ settings })
}

// PUT /api/admin/storage/settings { key, is_enabled?, value? }
export async function PUT(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Row
    const key = String(body.key || '')
    if (!KEYS.includes(key)) return NextResponse.json({ error: `key must be one of ${KEYS.join(', ')}` }, { status: 400 })
    const { data: existing } = await db.from('feature_toggles').select('*').eq('feature_key', key).single()
    const row = {
      feature_key: key,
      is_enabled: body.is_enabled !== undefined ? Boolean(body.is_enabled) : Boolean((existing as unknown as Row | null)?.is_enabled),
      value: body.value !== undefined ? body.value : ((existing as unknown as Row | null)?.value ?? {}),
      updated_by: auth.user.userId, updated_at: new Date().toISOString(),
    }
    if (existing) {
      await db.from('feature_toggles').update(row).eq('feature_key', key)
    } else {
      await db.from('feature_toggles').insert(row)
    }
    await audit(auth.user.userId, 'storage.settings_updated', 'feature_toggle', key, row, request)
    return NextResponse.json({ ok: true, setting: row })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

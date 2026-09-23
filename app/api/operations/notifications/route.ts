import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'

const db = new DBClient()

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const { data, error } = await db.from('operations_notifications').select('*').eq('recipient_user_id', auth.user.userId).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
  // managers also see role-targeted items
  if (auth.user.role === 'admin') {
    const { data: roleNotifs } = await db.from('operations_notifications').select('*').eq('recipient_user_id', 'manager').order('created_at', { ascending: false }).limit(100)
    rows = [...rows, ...(((roleNotifs as unknown as Array<Record<string, unknown>>) || []))]
    rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  }
  if (unreadOnly) rows = rows.filter((r) => !r.is_read)
  return NextResponse.json({ notifications: rows.slice(0, 100), unread: rows.filter((r) => !r.is_read).length })
}

export async function PUT(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const body = (await request.json()) as Record<string, unknown>
  if (body.id) {
    await db.from('operations_notifications').update({ is_read: true }).eq('id', String(body.id))
  } else {
    // mark all mine read
    const { data } = await db.from('operations_notifications').select('*').eq('recipient_user_id', auth.user.userId).limit(200)
    for (const n of ((data as unknown as Array<Record<string, unknown>>) || [])) {
      await db.from('operations_notifications').update({ is_read: true }).eq('id', String(n.id))
    }
  }
  return NextResponse.json({ ok: true })
}

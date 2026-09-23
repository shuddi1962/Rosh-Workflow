import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'
import { AUTO_REPLY_PLATFORMS } from '@/lib/social/auto-reply-config'

const db = new DBClient()

// GET /api/social/auto-reply/status — per-platform connection + activity status.
// All figures come from live tables (social_accounts, keyword_triggers,
// social_auto_replies, social_interactions). No mocked numbers.
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().slice(0, 10)

    const [accountsRes, triggersRes, repliesRes, interactionsRes, togglesRes] = await Promise.all([
      db.from('social_accounts').select('*').limit(100),
      db.from('keyword_triggers').select('*').limit(200),
      db.from('social_auto_replies').select('*').limit(500),
      db.from('social_interactions').select('*').limit(500),
      db.from('feature_toggles').select('*').limit(200),
    ])

    const accounts = ((accountsRes.data as unknown as Array<Record<string, unknown>>) || [])
    const triggers = ((triggersRes.data as unknown as Array<Record<string, unknown>>) || [])
    const replies = ((repliesRes.data as unknown as Array<Record<string, unknown>>) || [])
    const interactions = ((interactionsRes.data as unknown as Array<Record<string, unknown>>) || [])
    const toggles = ((togglesRes.data as unknown as Array<Record<string, unknown>>) || [])
    const toggleMap = new Map(toggles.map((t) => [String(t.feature_key), Boolean(t.is_enabled)]))

    const platforms = AUTO_REPLY_PLATFORMS.map((p) => {
      const account = accounts.find((a) => String(a.platform).toLowerCase() === p.id)
      const platformTriggers = triggers.filter(
        (t) => String(t.platform).toLowerCase() === p.id || String(t.platform).toLowerCase() === 'all'
      )
      const todaysReplies = replies.filter(
        (r) => String(r.platform).toLowerCase() === p.id && String(r.created_at || '').slice(0, 10) === today
      )
      const platformInteractions = interactions.filter((i) => String(i.platform).toLowerCase() === p.id)
      const leadsCreated = platformInteractions.filter((i) => i.lead_id).length
      const last = [...todaysReplies, ...platformInteractions].sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      )[0]

      return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        triggers: p.triggers,
        isConnected: Boolean(account && account.is_connected !== false),
        isEnabled: toggleMap.get(`auto_reply_${p.id}`) ?? false,
        activeTriggers: platformTriggers.filter((t) => t.is_active !== false).length,
        repliesToday: todaysReplies.length,
        leadsCreated,
        lastEvent: last ? String(last.created_at).slice(0, 16).replace('T', ' ') : 'No activity yet',
      }
    })

    return NextResponse.json({ platforms })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

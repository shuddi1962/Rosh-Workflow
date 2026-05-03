import { NextResponse } from 'next/server'
import { AUTO_REPLY_PLATFORMS } from '@/lib/social/auto-reply-config'
import { getAllTriggers, getActivePlatforms } from '@/lib/ai/socialAutoReply'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

async function getPlatformStatus() {
  try {
    const { data, error } = await db
      .from('feature_toggles')
      .select('feature_key, is_enabled')

    if (error) return {}
    const rows = (data as Array<{ feature_key: string; is_enabled: boolean }>) || []
    const toggles: Record<string, boolean> = {}
    for (const row of rows) {
      toggles[row.feature_key] = row.is_enabled
    }
    return toggles
  } catch {
    return {}
  }
}

export async function GET() {
  try {
    const toggles = await getPlatformStatus()
    const triggers = getAllTriggers()

    const platforms = AUTO_REPLY_PLATFORMS.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      triggers: p.triggers,
      is_enabled: toggles[`auto_reply_${p.id}`] ?? false,
    }))

    const stats = {
      total_triggers: triggers.length,
      active_triggers: triggers.filter(t => t.is_active).length,
      platforms_enabled: platforms.filter(p => p.is_enabled).length,
      total_fire_count: triggers.reduce((sum, t) => sum + t.fire_count, 0),
    }

    return NextResponse.json({ platforms, triggers, stats })
  } catch {
    const triggers = getAllTriggers()

    const platforms = AUTO_REPLY_PLATFORMS.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      triggers: p.triggers,
      is_enabled: false,
    }))

    const stats = {
      total_triggers: triggers.length,
      active_triggers: triggers.filter(t => t.is_active).length,
      platforms_enabled: 0,
      total_fire_count: triggers.reduce((sum, t) => sum + t.fire_count, 0),
    }

    return NextResponse.json({ platforms, triggers, stats })
  }
}

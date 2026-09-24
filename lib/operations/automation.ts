import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()
type Row = Record<string, unknown>

async function ruleEnabled(key: string): Promise<boolean> {
  try {
    const { data } = await db.from('automation_rules').select('*').eq('rule_key', key).single()
    const row = (data as unknown as Row | null)
    if (!row) return true // table not yet migrated → default on
    return row.is_enabled !== false
  } catch {
    return true
  }
}

async function ruleConfig(key: string): Promise<Row> {
  try {
    const { data } = await db.from('automation_rules').select('*').eq('rule_key', key).single()
    return ((data as unknown as Row | null)?.config as Row) || {}
  } catch {
    return {}
  }
}

async function markFired(key: string): Promise<void> {
  try {
    const { data } = await db.from('automation_rules').select('*').eq('rule_key', key).single()
    const row = (data as unknown as Row | null)
    if (!row) return
    await db.from('automation_rules').update({
      last_fired_at: new Date().toISOString(),
      fire_count: Number(row.fire_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('rule_key', key)
  } catch { /* never break */ }
}

async function alreadyNotified(recipient: string, kind: string, entityId: string, today: string): Promise<boolean> {
  try {
    const { data } = await db.from('operations_notifications').select('*').eq('recipient_user_id', recipient).eq('kind', kind).eq('entity_id', entityId).limit(50)
    return (((data as unknown as Row[]) || []).some((n) => String(n.created_at || '').slice(0, 10) === today))
  } catch {
    return false
  }
}

export interface AutomationResult {
  low_stock: number
  receipt_reminders: number
  report_reminders: number
  task_reminders: number
}

/**
 * evaluateAutomation — the ONE automation engine for operations.
 * Rules live in automation_rules (admin-editable thresholds).
 * Called by Vercel Cron (/api/cron/operations-reminders) and manually
 * via /api/automation/evaluate. Only creates notifications + events;
 * approvals and state changes stay human.
 */
export async function evaluateAutomation(): Promise<AutomationResult> {
  const today = new Date().toISOString().slice(0, 10)
  const result: AutomationResult = { low_stock: 0, receipt_reminders: 0, report_reminders: 0, task_reminders: 0 }

  // Rule 1: low stock — products at/below reorder level (once per product per day)
  if (await ruleEnabled('low_stock_alert')) {
    try {
      const { data } = await db.from('products').select('*').limit(1000)
      for (const p of ((data as unknown as Row[]) || [])) {
        const onHand = Number(p.quantity_on_hand || 0)
        const reorder = Number(p.reorder_level || 0)
        if (reorder > 0 && onHand <= reorder) {
          const key = `lowstock:${String(p.id)}`
          if (await alreadyNotified('manager', 'low_stock', key, today)) continue
          await db.from('operations_notifications').insert({
            recipient_user_id: 'manager',
            recipient_role: 'manager',
            kind: 'low_stock',
            title: 'Low stock alert',
            message: `${String(p.name)} is at ${onHand} (reorder ${reorder})`,
            entity_type: 'product',
            entity_id: String(p.id),
            is_read: false,
            created_at: new Date().toISOString(),
          })
          result.low_stock += 1
        }
      }
      if (result.low_stock) await markFired('low_stock_alert')
    } catch { /* never break */ }
  }

  // Rule 2: receipts held too long
  if (await ruleEnabled('receipt_held_reminder_days')) {
    try {
      const cfg = await ruleConfig('receipt_held_reminder_days')
      const days = Number(cfg.days || 3)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      const { data } = await db.from('receipts').select('*').limit(1000)
      for (const r of ((data as unknown as Row[]) || [])) {
        if (!['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))) continue
        if (new Date(String(r.holder_since || r.created_at)) >= cutoff) continue
        const holder = String(r.current_holder || r.created_by)
        if (await alreadyNotified(holder, 'receipt_overdue', String(r.id), today)) continue
        await db.from('operations_notifications').insert({
          recipient_user_id: holder,
          kind: 'receipt_overdue',
          title: 'Receipt still pending submission',
          message: `${String(r.receipt_code)} (${String(r.supplier_vendor)}) held since ${String(r.holder_since || r.created_at).slice(0, 10)}. Please scan and submit.`,
          entity_type: 'receipt',
          entity_id: String(r.id),
          is_read: false,
          created_at: new Date().toISOString(),
        })
        result.receipt_reminders += 1
      }
      if (result.receipt_reminders) await markFired('receipt_held_reminder_days')
    } catch { /* never break */ }
  }

  return result
}

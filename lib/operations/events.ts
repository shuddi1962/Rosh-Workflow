import { DBClient } from '@/lib/insforge/server'
import { audit } from '@/lib/operations/server'
import type { JWTPayload } from '@/lib/auth'

const db = new DBClient()

export type Row = Record<string, unknown>

export interface BusinessEventInput {
  event_type: string
  entity_type: string
  entity_id: string
  entity_ref?: string
  title: string
  summary?: string
  metadata?: Record<string, unknown>
  related_entity_type?: string
  related_entity_id?: string
  related_entity_ref?: string
}

/**
 * emitEvent — the single write path for the Business Operating System
 * activity stream. Every domain action (GRN posted, stock moved, receipt
 * captured/submitted/verified, task assigned/completed, report submitted,
 * file linked, approval decided) writes one row here.
 *
 * Consumers (notifications, daily/monthly reports, timelines, analytics)
 * READ from business_events — modules never recompute each other's views.
 * Failures never break the primary flow.
 */
export async function emitEvent(
  user: JWTPayload,
  input: BusinessEventInput,
  request?: Request
): Promise<void> {
  try {
    await db.from('business_events').insert({
      event_type: input.event_type,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      entity_ref: input.entity_ref || '',
      actor_user_id: user.userId,
      actor_name: user.name || user.email,
      title: input.title,
      summary: input.summary || '',
      metadata: input.metadata || {},
      related_entity_type: input.related_entity_type || '',
      related_entity_id: input.related_entity_id || '',
      related_entity_ref: input.related_entity_ref || '',
      created_at: new Date().toISOString(),
    })
  } catch {
    // event stream must never break the primary transaction
  }
  await audit(
    user.userId,
    `event.${input.event_type}`,
    input.entity_type,
    input.entity_id,
    { ref: input.entity_ref || '', ...(input.metadata || {}) },
    request
  )
}

/**
 * linkRecords — record one edge in the shared business graph.
 * Example: PO -> GRN -> movement -> receipt -> supplier -> task -> report.
 * Duplicate links are ignored (unique constraint).
 */
export async function linkRecords(input: {
  source_type: string
  source_id: string
  target_type: string
  target_id: string
  link_type?: string
  created_by?: string
}): Promise<void> {
  try {
    await db.from('record_links').insert({
      source_type: input.source_type,
      source_id: input.source_id,
      target_type: input.target_type,
      target_id: input.target_id,
      link_type: input.link_type || 'related',
      created_by: input.created_by || '',
      created_at: new Date().toISOString(),
    })
  } catch {
    // duplicate or missing table — never break the flow
  }
}

/** Fetch every link touching a record, in either direction. */
export async function recordLinks(
  entityType: string,
  entityId: string
): Promise<Row[]> {
  try {
    const [a, b] = await Promise.all([
      db.from('record_links').select('*').eq('source_type', entityType).eq('source_id', entityId).limit(200),
      db.from('record_links').select('*').eq('target_type', entityType).eq('target_id', entityId).limit(200),
    ])
    return [
      ...(((a.data as unknown as Row[]) || [])),
      ...(((b.data as unknown as Row[]) || [])),
    ]
  } catch {
    return []
  }
}

/** Recent global activity feed (dashboards, ops overview). */
export async function recentEvents(limit = 50): Promise<Row[]> {
  try {
    const { data } = await db
      .from('business_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200))
    return ((data as unknown as Row[]) || [])
  } catch {
    return []
  }
}

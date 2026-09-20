import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export interface AuditLogEntry {
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  ip_address: string
  user_agent: string
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  await db.from('audit_logs').insert({
    id: crypto.randomUUID(),
    user_id: entry.user_id,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    details: entry.details,
    ip_address: entry.ip_address,
    user_agent: entry.user_agent,
    created_at: new Date().toISOString()
  })
}

export async function getAuditLogs(filters?: {
  userId?: string
  entityType?: string
  action?: string
  limit?: number
  offset?: number
}): Promise<Array<Record<string, unknown>>> {
  let query = db.from('audit_logs').select('*')
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType)
  }
  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  
  const limit = filters?.limit || 100
  const offset = filters?.offset || 0
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  
  const dataArray = data as unknown as Array<Record<string, unknown>>
  return dataArray.slice(offset, offset + limit)
}

export async function getAuditStats(days = 30): Promise<{
  total_logs: number
  actions_breakdown: Record<string, number>
  users_breakdown: Record<string, number>
  entity_types_breakdown: Record<string, number>
}> {
  const { data, error } = await db
    .from('audit_logs')
    .select('*')
  
  if (error || !data) {
    return {
      total_logs: 0,
      actions_breakdown: {},
      users_breakdown: {},
      entity_types_breakdown: {}
    }
  }
  
  const logs = data as unknown as Array<Record<string, unknown>>
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const recentLogs = logs.filter(log => {
    const createdAt = log.created_at as string
    return createdAt && new Date(createdAt) >= cutoffDate
  })
  
  const actionsBreakdown: Record<string, number> = {}
  const usersBreakdown: Record<string, number> = {}
  const entityTypesBreakdown: Record<string, number> = {}
  
  for (const log of recentLogs) {
    const action = log.action as string
    const userId = log.user_id as string
    const entityType = log.entity_type as string
    
    actionsBreakdown[action] = (actionsBreakdown[action] || 0) + 1
    usersBreakdown[userId] = (usersBreakdown[userId] || 0) + 1
    entityTypesBreakdown[entityType] = (entityTypesBreakdown[entityType] || 0) + 1
  }
  
  return {
    total_logs: recentLogs.length,
    actions_breakdown: actionsBreakdown,
    users_breakdown: usersBreakdown,
    entity_types_breakdown: entityTypesBreakdown
  }
}

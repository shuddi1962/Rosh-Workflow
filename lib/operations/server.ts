import { NextResponse } from 'next/server'
import { verifyToken, type JWTPayload } from '@/lib/auth'
import { DBClient } from '@/lib/insforge/server'
import { createAuditLog } from '@/lib/audit'

export function getAuth(request: Request): { token: string; user: JWTPayload } | null {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')?.trim()
  if (!token) return null
  const user = verifyToken(token)
  if (!user) return null
  return { token, user }
}

export function requireAuth(request: Request): { user: JWTPayload } | NextResponse {
  const auth = getAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { user: auth.user }
}

export function requireRole(request: Request, roles: string[]): { user: JWTPayload } | NextResponse {
  const result = requireAuth(request)
  if (result instanceof NextResponse) return result
  if (!roles.includes(result.user.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 })
  }
  return result
}

export async function notifyUser(input: {
  recipient_user_id: string
  recipient_role?: string
  kind: string
  title: string
  message: string
  entity_type?: string
  entity_id?: string
}): Promise<void> {
  try {
    const db = new DBClient()
    await db.from('operations_notifications').insert({
      recipient_user_id: input.recipient_user_id || 'manager',
      recipient_role: input.recipient_role || 'employee',
      kind: input.kind,
      title: input.title,
      message: input.message,
      entity_type: input.entity_type || '',
      entity_id: input.entity_id || '',
      is_read: false,
      created_at: new Date().toISOString(),
    })
  } catch {
    // notifications must never break the main flow
  }
}

export async function audit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>,
  request?: Request
): Promise<void> {
  try {
    await createAuditLog({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: request?.headers.get('x-forwarded-for') || '',
      user_agent: request?.headers.get('user-agent') || '',
    })
  } catch {
    // audit failure should not break the flow
  }
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for') || ''
}

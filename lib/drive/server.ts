import crypto from 'crypto'
import { DBClient, getDBPool } from '@/lib/insforge/server'
import { type JWTPayload } from '@/lib/auth'
import { audit, notifyUser } from '@/lib/operations/server'

const db = new DBClient()
export const DRIVE_BUCKET = 'cloud-drive'

export type Row = Record<string, unknown>

// ---- file type policy -------------------------------------------------

export const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt',
  'jpg', 'jpeg', 'png', 'webp', 'svg', 'gif',
  'zip', 'rar', 'mp4', 'mov', 'mp3', 'wav',
])

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif',
  zip: 'application/zip', rar: 'application/vnd.rar',
  mp4: 'video/mp4', mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav',
}

export function extOf(name: string): string {
  const parts = name.toLowerCase().split('.')
  return parts.length > 1 ? (parts[parts.length - 1] || '') : ''
}

export function mimeFor(name: string, fallback = 'application/octet-stream'): string {
  return MIME_BY_EXT[extOf(name)] || fallback
}

export function categoryOf(mime: string, ext: string): 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other' {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (['zip', 'rar'].includes(ext)) return 'archive'
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('sheet') || mime.includes('excel') || mime.includes('powerpoint') || mime.includes('presentation') || mime === 'text/csv' || mime === 'text/plain') return 'document'
  return 'other'
}

export function formatBytes(n: number): string {
  if (!n || n <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const v = n / Math.pow(1024, i)
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[i]}`
}

// ---- workspace / subscription / usage ---------------------------------

export async function resolveBusinessId(user: JWTPayload): Promise<string | null> {
  if (user.businessId) {
    const { data } = await db.from('businesses').select('id').eq('id', user.businessId).single()
    if (data) return String((data as unknown as Row).id)
  }
  if (user.userId) {
    const { data } = await db.from('users').select('business_id').eq('id', user.userId).single()
    const bid = (data as unknown as Row | null)?.business_id
    if (bid) return String(bid)
  }
  const { data } = await db.from('businesses').select('id').eq('slug', 'roshanal').single()
  if (data) return String((data as unknown as Row).id)
  return null
}

export interface StorageContext {
  business_id: string
  plan: Row
  subscription: Row | null
  used_bytes: number
  file_count: number
}

async function freePlan(): Promise<Row | null> {
  const { data } = await db.from('storage_plans').select('*').eq('name', 'Free').single()
  return (data as unknown as Row | null) || null
}

export async function getStorageContext(businessId: string): Promise<StorageContext> {
  const [subsRes, usageRes] = await Promise.all([
    db.from('storage_subscriptions').select('*').eq('business_id', businessId).eq('status', 'active').limit(10),
    db.from('storage_usage').select('*').eq('business_id', businessId).single(),
  ])
  const subs = ((subsRes.data as unknown as Row[]) || []).sort(
    (a, b) => String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || ''))
  )
  let subscription = subs[0] || null
  if (!subscription) {
    const free = await freePlan()
    const row = {
      business_id: businessId,
      plan_id: (free?.id as string) || null,
      plan_name: 'Free',
      capacity_bytes: Number(free?.capacity_bytes || 5368709120),
      status: 'active',
      billing_cycle: 'monthly',
      provider: 'manual',
      provider_reference: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data } = await db.from('storage_subscriptions').insert(row).select().single()
    subscription = (data as unknown as Row) || row
  }
  let plan: Row | null = null
  const sub = subscription as Row
  if (sub.plan_id) {
    const { data } = await db.from('storage_plans').select('*').eq('id', String(sub.plan_id)).single()
    plan = (data as unknown as Row | null) || null
  }
  if (!plan) {
    const { data } = await db.from('storage_plans').select('*').eq('name', String(sub.plan_name || 'Free')).single()
    plan = (data as unknown as Row | null) || null
  }
  if (!plan) plan = (await freePlan()) || { name: 'Free', capacity_bytes: 5368709120, max_file_bytes: 104857600, retention_days: 30 }

  let usage = usageRes.data as unknown as Row | null
  if (!usage) {
    // Backfill from real file rows (trash counts toward quota — documented in UI)
    const { data } = await db.from('cloud_files').select('size_bytes').eq('business_id', businessId).limit(10000)
    const files = ((data as unknown as Row[]) || [])
    const used = files.reduce((s, f) => s + Number(f.size_bytes || 0), 0)
    const fresh = { business_id: businessId, used_bytes: used, file_count: files.length, last_warning_level: 0, updated_at: new Date().toISOString() }
    await db.from('storage_usage').insert(fresh)
    usage = fresh
  }
  return {
    business_id: businessId,
    plan,
    subscription,
    used_bytes: Number(usage.used_bytes || 0),
    file_count: Number(usage.file_count || 0),
  }
}

export async function addUsage(businessId: string, bytes: number, filesDelta: number): Promise<void> {
  const { data } = await db.from('storage_usage').select('*').eq('business_id', businessId).single()
  const cur = data as unknown as Row | null
  if (!cur) {
    await db.from('storage_usage').insert({ business_id: businessId, used_bytes: Math.max(0, bytes), file_count: Math.max(0, filesDelta), last_warning_level: 0, updated_at: new Date().toISOString() })
    return
  }
  await db.from('storage_usage').update({
    used_bytes: Math.max(0, Number(cur.used_bytes || 0) + bytes),
    file_count: Math.max(0, Number(cur.file_count || 0) + filesDelta),
    updated_at: new Date().toISOString(),
  }).eq('business_id', businessId)
}

export function quotaCheck(ctx: StorageContext, incomingBytes: number): { ok: boolean; remaining: number; quota: number; reason?: string } {
  const quota = Number(ctx.plan.capacity_bytes || 0)
  const remaining = Math.max(0, quota - ctx.used_bytes)
  if (incomingBytes > remaining) {
    return { ok: false, remaining, quota, reason: `Storage limit exceeded: ${formatBytes(incomingBytes)} needed but only ${formatBytes(remaining)} free on the ${String(ctx.plan.name)} plan.` }
  }
  const maxFile = Number(ctx.plan.max_file_bytes || 0)
  if (maxFile > 0 && incomingBytes > maxFile) {
    return { ok: false, remaining, quota, reason: `File too large: limit is ${formatBytes(maxFile)} on the ${String(ctx.plan.name)} plan.` }
  }
  return { ok: true, remaining, quota }
}

// Warn once per level per day: 80 / 90 / 100 (% used)
export async function maybeWarnQuota(businessId: string, ctx: StorageContext, ownerUserId: string): Promise<void> {
  const quota = Number(ctx.plan.capacity_bytes || 0)
  if (!quota) return
  const pct = (ctx.used_bytes / quota) * 100
  const level = pct >= 100 ? 100 : pct >= 90 ? 90 : pct >= 80 ? 80 : 0
  if (!level) return
  const { data } = await db.from('storage_usage').select('*').eq('business_id', businessId).single()
  const row = data as unknown as Row | null
  const today = new Date().toISOString().slice(0, 10)
  const lastAt = String(row?.last_warning_at || '').slice(0, 10)
  if (Number(row?.last_warning_level || 0) >= level && lastAt === today) return
  await db.from('storage_usage').update({ last_warning_level: level, last_warning_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('business_id', businessId)
  await notifyUser({
    recipient_user_id: ownerUserId,
    kind: level >= 100 ? 'storage_full' : 'storage_warning',
    title: level >= 100 ? 'Cloud Drive storage full' : `Cloud Drive ${level}% full`,
    message: level >= 100
      ? `Workspace storage is full (${formatBytes(ctx.used_bytes)} of ${formatBytes(quota)}). Uploads are paused — upgrade or free up space.`
      : `Workspace has used ${formatBytes(ctx.used_bytes)} of ${formatBytes(quota)} (${Math.round(pct)}%). Consider upgrading soon.`,
    entity_type: 'storage',
    entity_id: businessId,
  })
}

// ---- object storage (Supabase Storage, private bucket, signed URLs) -----

function rawClient() {
  return getDBPool().getClient()
}

export async function putObject(key: string, bytes: Uint8Array, mime: string): Promise<void> {
  const sb = rawClient()
  const { error } = await sb.storage.from(DRIVE_BUCKET).upload(key, bytes, { contentType: mime, upsert: true })
  if (error) throw new Error(`Object upload failed: ${error.message}`)
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const sb = rawClient()
  const { data, error } = await sb.storage.from(DRIVE_BUCKET).download(key)
  if (error || !data) throw new Error(`Object download failed: ${error?.message || 'missing'}`)
  return new Uint8Array(await data.arrayBuffer())
}

export async function signedUrl(key: string, expiresSeconds = 3600): Promise<string> {
  const sb = rawClient()
  const { data, error } = await sb.storage.from(DRIVE_BUCKET).createSignedUrl(key, expiresSeconds)
  if (error || !data?.signedUrl) throw new Error(`Signed URL failed: ${error?.message || 'missing'}`)
  return data.signedUrl
}

export async function removeObject(key: string): Promise<void> {
  const sb = rawClient()
  await sb.storage.from(DRIVE_BUCKET).remove([key])
}

export function sha256Hex(bytes: Uint8Array): string {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

// ---- activity -----------------------------------------------------------

export async function driveActivity(input: {
  business_id: string
  file_id?: string | null
  folder_id?: string | null
  actor_user_id: string
  actor_name: string
  action: string
  details?: Record<string, unknown>
  request?: Request
}): Promise<void> {
  try {
    await db.from('cloud_file_activity').insert({
      business_id: input.business_id,
      file_id: input.file_id || null,
      folder_id: input.folder_id || null,
      actor_user_id: input.actor_user_id,
      actor_name: input.actor_name,
      action: input.action,
      details: input.details || {},
      created_at: new Date().toISOString(),
    })
  } catch { /* activity must never break the flow */ }
  await audit(input.actor_user_id, `drive.${input.action}`, input.file_id ? 'cloud_file' : 'cloud_folder', String(input.file_id || input.folder_id || ''), { business_id: input.business_id, ...(input.details || {}) }, input.request)
}

export async function driveFileRow(businessId: string, fileId: string): Promise<Row | null> {
  const { data } = await db.from('cloud_files').select('*').eq('id', fileId).eq('business_id', businessId).single()
  return (data as unknown as Row | null) || null
}

export async function driveFolderRow(businessId: string, folderId: string): Promise<Row | null> {
  const { data } = await db.from('cloud_folders').select('*').eq('id', folderId).eq('business_id', businessId).single()
  return (data as unknown as Row | null) || null
}

// Server-side access check: owner, platform admin, or an internal share on
// the file (or any ancestor folder). Returns the share permission or null.
export async function filePermission(businessId: string, file: Row, user: JWTPayload): Promise<'owner' | 'editor' | 'viewer' | 'commenter' | null> {
  if (String(file.created_by || '') === user.userId) return 'owner'
  if (user.role === 'admin') return 'owner'
  const { data } = await db.from('cloud_file_shares').select('*').eq('business_id', businessId).limit(2000)
  const shares = ((data as unknown as Row[]) || [])
  const mine = shares.filter((s) => String(s.shared_with_user_id || '') === user.userId || (user.email && String(s.shared_with_email || '').toLowerCase() === user.email.toLowerCase()))
  if (mine.some((s) => s.file_id && String(s.file_id) === String(file.id))) {
    const p = String(mine.find((s) => s.file_id && String(s.file_id) === String(file.id))?.permission || 'viewer')
    return (['editor', 'viewer', 'commenter'].includes(p) ? p : 'viewer') as 'editor' | 'viewer' | 'commenter'
  }
  // Folder shares inherit down the ancestor chain.
  if (file.folder_id) {
    const { data: folders } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(2000)
    const all = ((folders as unknown as Row[]) || [])
    const byId = new Map(all.map((f) => [String(f.id), f]))
    let cur: Row | undefined = byId.get(String(file.folder_id))
    const chain: string[] = []
    while (cur) {
      chain.push(String(cur.id))
      cur = cur.parent_id ? byId.get(String(cur.parent_id)) : undefined
    }
    const hit = mine.find((s) => s.folder_id && chain.includes(String(s.folder_id)))
    if (hit) {
      const p = String(hit.permission || 'viewer')
      return (['editor', 'viewer', 'commenter'].includes(p) ? p : 'viewer') as 'editor' | 'viewer' | 'commenter'
    }
  }
  return null
}

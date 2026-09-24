import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { signedUrl, driveFileRow, type Row } from '@/lib/drive/server'
import { hashSensitive } from '@/lib/encryption'

const db = new DBClient()

// GET /api/drive/s/[token]?password= — public secure link (no login).
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { data } = await db.from('cloud_share_links').select('*').eq('token', params.token).single()
    const link = data as unknown as Row | null
    if (!link || link.is_active === false) return NextResponse.json({ error: 'Link not found or revoked' }, { status: 404 })
    if (link.expires_at && new Date(String(link.expires_at)) < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 })
    }
    if (link.max_downloads != null && Number(link.download_count || 0) >= Number(link.max_downloads)) {
      return NextResponse.json({ error: 'Download limit reached for this link' }, { status: 410 })
    }
    if (link.password_hash) {
      const pw = new URL(request.url).searchParams.get('password') || ''
      if (!pw || hashSensitive(pw) !== String(link.password_hash)) {
        return NextResponse.json({ error: 'Password required', password_required: true }, { status: 401 })
      }
    }
    if (!link.file_id) return NextResponse.json({ error: 'Folder links open inside Cloud Drive' }, { status: 400 })
    const file = await driveFileRow(String(link.business_id), String(link.file_id))
    if (!file || file.trashed_at) return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
    const downloadUrl = await signedUrl(String(file.storage_key), 3600)
    await db.from('cloud_share_links').update({ download_count: Number(link.download_count || 0) + 1 }).eq('id', String(link.id))
    return NextResponse.json({
      file: { id: file.id, name: file.name, mime_type: file.mime_type, extension: file.extension, size_bytes: file.size_bytes },
      permission: String(link.permission || 'viewer'),
      downloadUrl,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

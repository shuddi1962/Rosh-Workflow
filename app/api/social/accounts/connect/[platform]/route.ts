import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { account_name, account_id, access_token } = body

    const name = account_name || `${params.platform}-account-${Date.now()}`

    const { data, error } = await db
      .from('social_accounts')
      .insert({
        platform: params.platform,
        account_name: name,
        account_id: account_id || '',
        access_token: access_token || '',
        token_expiry: null,
        is_connected: !!access_token,
        post_count_today: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const response = access_token
      ? { account: data, message: `${params.platform} account connected` }
      : { account: data, message: `${params.platform} account registered. OAuth setup required for full access.`, oauth_required: true }
    return NextResponse.json(response)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

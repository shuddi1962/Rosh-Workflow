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

    const body = await request.json()
    const { account_name, account_id, access_token } = body

    if (!account_name) {
      return NextResponse.json({ error: 'account_name is required' }, { status: 400 })
    }

    const { data, error } = await db
      .from('social_accounts')
      .insert({
        platform: params.platform,
        account_name,
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
    return NextResponse.json({ account: data, message: `${params.platform} account connected` })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

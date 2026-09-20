import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('social_accounts')
      .select('*')
      .order('platform', { ascending: true })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ accounts: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { platform, account_name, account_id, access_token } = await request.json()
    
    if (!platform || !account_name) {
      return NextResponse.json({ error: 'platform and account_name are required' }, { status: 400 })
    }
    
    const { data, error } = await db
      .from('social_accounts')
      .insert({
        platform,
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
    return NextResponse.json({ account: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

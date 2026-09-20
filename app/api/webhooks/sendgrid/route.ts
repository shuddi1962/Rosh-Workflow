import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    await db
      .from('audit_logs')
      .insert({
        user_id: 'system',
        action: 'sendgrid_webhook',
        entity_type: 'webhook',
        entity_id: body.message_id || 'unknown',
        details: body,
        ip_address: '0.0.0.0',
        user_agent: 'sendgrid',
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

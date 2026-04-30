import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    await insforgeAdmin
      .database
      .from('audit_logs')
      .insert([{
        user_id: 'system',
        action: 'twilio_webhook',
        entity_type: 'webhook',
        entity_id: body.MessageSid || 'unknown',
        details: body,
        ip_address: '0.0.0.0',
        user_agent: 'twilio',
        created_at: new Date().toISOString()
      }])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'

export async function POST(request: Request) {
  try {
    const { data, error } = await insforgeAdmin
      .database
      .from('audit_logs')
      .insert([{
        user_id: 'system',
        action: 'webhook_received',
        entity_type: 'webhook',
        entity_id: 'meta',
        details: { timestamp: new Date().toISOString() },
        ip_address: '0.0.0.0',
        user_agent: 'webhook',
        created_at: new Date().toISOString()
      }])
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

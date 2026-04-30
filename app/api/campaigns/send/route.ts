import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()

export async function POST(request: NextRequest) {
  try {
    const { campaign_id } = await request.json()
    
    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }
    
    const { data: campaign, error: campError } = await db
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()
    
    if (campError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    const campaignObj = campaign as unknown as Record<string, unknown>
    const targetLeads = (campaignObj.target_leads as string[]) || []
    
    const { data: leads } = await db
      .from('leads')
      .select('*')
      .in('id', targetLeads)
    
    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found for this campaign' }, { status: 404 })
    }
    
    let sentCount = 0
    let failedCount = 0
    const results = []
    
    if (campaignObj.type === 'email') {
      const sendgridKey = await getApiKey('sendgrid', 'Production Key')
      if (sendgridKey) {
        for (const lead of leads as Array<Record<string, unknown>>) {
          try {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${sendgridKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: lead.email, name: lead.name }] }],
                from: { email: 'info@roshanalinfotech.com', name: 'Roshanal Infotech' },
                subject: campaignObj.subject || 'Special Offer from Roshanal Infotech',
                content: [{ type: 'text/plain', value: campaignObj.message_template as string }]
              }),
              signal: AbortSignal.timeout(10000)
            })
            
            if (response.ok) {
              sentCount++
              results.push({ lead: lead.name, status: 'sent' })
            } else {
              failedCount++
              results.push({ lead: lead.name, status: 'failed' })
            }
          } catch {
            failedCount++
          }
        }
      }
    } else if (campaignObj.type === 'sms') {
      const twilioSid = await getApiKey('twilio_sid', 'Production Key')
      const twilioToken = await getApiKey('twilio_token', 'Production Key')
      
      if (twilioSid && twilioToken) {
        for (const lead of leads as Array<Record<string, unknown>>) {
          try {
            const response = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  From: campaignObj.from_number as string || '+1234567890',
                  To: lead.phone as string,
                  Body: campaignObj.message_template as string
                }),
                signal: AbortSignal.timeout(10000)
              }
            )
            
            if (response.ok) {
              sentCount++
              results.push({ lead: lead.name, status: 'sent' })
            } else {
              failedCount++
              results.push({ lead: lead.name, status: 'failed' })
            }
          } catch {
            failedCount++
          }
        }
      }
    } else if (campaignObj.type === 'whatsapp') {
      const metaKey = await getApiKey('meta', 'Production Key')
      
      if (metaKey) {
        for (const lead of leads as Array<Record<string, unknown>>) {
          try {
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${campaignObj.whatsapp_phone_id}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${metaKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: lead.phone as string,
                  text: { body: campaignObj.message_template as string }
                }),
                signal: AbortSignal.timeout(10000)
              }
            )
            
            if (response.ok) {
              sentCount++
              results.push({ lead: lead.name, status: 'sent' })
            } else {
              failedCount++
              results.push({ lead: lead.name, status: 'failed' })
            }
          } catch {
            failedCount++
          }
        }
      }
    }
    
    await db
      .from('campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        stats: { sent: sentCount, failed: failedCount, results }
      })
      .eq('id', campaign_id)
    
    return NextResponse.json({
      message: `Campaign sent: ${sentCount} successful, ${failedCount} failed`,
      stats: { sent: sentCount, failed: failedCount }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
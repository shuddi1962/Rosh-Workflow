import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const stage = searchParams.get('stage')
    const tier = searchParams.get('tier')
    const division = searchParams.get('division')
    const search = searchParams.get('search')

    let query = db.from('leads').select('*').order('created_at', { ascending: false })

    if (stage) query = query.eq('stage', stage)
    if (tier) query = query.eq('tier', tier)
    if (division) query = query.eq('division_interest', division)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let leads = (data || []) as unknown as Array<Record<string, unknown>>

    if (search) {
      const lower = search.toLowerCase()
      leads = leads.filter(l =>
        String(l.full_name || '').toLowerCase().includes(lower) ||
        String(l.company || '').toLowerCase().includes(lower) ||
        String(l.email || '').toLowerCase().includes(lower) ||
        String(l.phone || '').includes(lower)
      )
    }

    const total = leads.length
    const offset = (page - 1) * limit
    const paginated = leads.slice(offset, offset + limit)

    return NextResponse.json({ leads: paginated, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const now = new Date().toISOString()
    const leadData = {
      id: crypto.randomUUID(),
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      full_name: body.full_name || `${body.first_name || ''} ${body.last_name || ''}`.trim(),
      email: body.email || null,
      phone: body.phone || '',
      whatsapp: body.whatsapp || null,
      company: body.company || null,
      job_title: body.job_title || null,
      website: body.website || null,
      linkedin_url: body.linkedin_url || null,
      instagram_handle: body.instagram_handle || null,
      country: body.country || 'Nigeria',
      state: body.state || 'Rivers State',
      city: body.city || 'Port Harcourt',
      address: body.address || null,
      area: body.area || null,
      division_interest: body.division_interest || 'both',
      product_interests: body.product_interests || [],
      customer_type: body.customer_type || 'individual',
      company_size: body.company_size || null,
      industry: body.industry || null,
      stage: body.stage || 'new_lead',
      score: body.score || 0,
      tier: body.tier || 'cold',
      icp_match: body.icp_match || 0,
      budget_signal: body.budget_signal || 'unknown',
      urgency: body.urgency || 'unknown',
      decision_maker: body.decision_maker ?? false,
      qualification_status: body.qualification_status || 'pending',
      qualification_grade: body.qualification_grade || 'C',
      qualification_reasons: body.qualification_reasons || [],
      disqualifiers: body.disqualifiers || [],
      qualification_notes: body.qualification_notes || '',
      recommended_approach: body.recommended_approach || '',
      talking_points: body.talking_points || [],
      best_channel: body.best_channel || 'whatsapp',
      qualified_at: null,
      source: body.source || 'manual',
      source_detail: body.source_detail || null,
      utm_source: body.utm_source || null,
      utm_campaign: body.utm_campaign || null,
      tags: body.tags || [],
      notes: body.notes || '',
      emails_sent: 0,
      emails_opened: 0,
      emails_clicked: 0,
      whatsapp_sent: 0,
      sms_sent: 0,
      calls_made: 0,
      calls_answered: 0,
      last_contacted: null,
      last_response: null,
      next_action: body.next_action || 'Qualify lead',
      next_action_date: body.next_action_date || null,
      next_action_type: body.next_action_type || 'email',
      assigned_to: body.assigned_to || null,
      estimated_deal_value_ngn: body.estimated_deal_value_ngn || null,
      products_quoted: body.products_quoted || [],
      email_consent: body.email_consent ?? true,
      sms_consent: body.sms_consent ?? true,
      whatsapp_consent: body.whatsapp_consent ?? true,
      call_consent: body.call_consent ?? true,
      opted_out: body.opted_out || false,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await db.from('leads').insert(leadData)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ lead: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET() {
  try {
    const { data: leads, error } = await db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const leadsArr = (leads || []) as unknown as Array<Record<string, unknown>>

    const stages = [
      'new_lead', 'qualified', 'contacted', 'interested',
      'quote_sent', 'negotiation', 'customer', 'lost'
    ]

    const pipeline = stages.map(stage => ({
      id: stage,
      count: leadsArr.filter(l => l.stage === stage).length,
      total_value: leadsArr
        .filter(l => l.stage === stage)
        .reduce((sum, l) => sum + ((l.estimated_deal_value_ngn as number) || 0), 0),
    }))

    return NextResponse.json({ pipeline, total_leads: leadsArr.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

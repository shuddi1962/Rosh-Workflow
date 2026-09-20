import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leads } = await request.json()

    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: 'leads array is required' }, { status: 400 })
    }

    const leadsToInsert = leads.map((lead: Record<string, unknown>) => ({
      name: lead.name || 'Unknown',
      phone: lead.phone || '',
      email: lead.email || null,
      company: lead.company || null,
      location: lead.location || 'Port Harcourt',
      division_interest: lead.division_interest || 'both',
      product_interest: lead.product_interest || [],
      source: lead.source || 'import',
      status: 'new',
      score: 50,
      tier: 'warm',
      notes: lead.notes || '',
      created_at: new Date().toISOString()
    }))

    const { data, error } = await db
      .from('leads')
      .insert(leadsToInsert)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: `${leadsToInsert.length} leads imported`, leads: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

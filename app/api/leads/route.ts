import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ leads: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const leadData = {
      id: crypto.randomUUID(),
      full_name: body.name || body.full_name || '',
      first_name: body.first_name || (body.name ? body.name.split(' ')[0] : ''),
      last_name: body.last_name || (body.name ? body.name.split(' ').slice(1).join(' ') : ''),
      name: body.name || body.full_name || '',
      phone: body.phone || '',
      email: body.email || null,
      company: body.company || null,
      location: body.location || 'Port Harcourt, Rivers State',
      division_interest: body.division_interest || 'tech',
      product_interest: body.product_interest || [],
      product_interests: body.product_interests || body.product_interest || [],
      source: body.source || 'manual',
      status: body.status || 'new',
      stage: body.stage || body.status || 'new_lead',
      notes: body.notes || '',
      score: body.score || Math.floor(Math.random() * 50) + 50,
      tier: body.tier || 'warm',
      last_contact: now,
      next_action: body.next_action || 'Follow up within 24 hours',
      created_at: now,
      updated_at: now
    }

    const { data, error } = await db
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lead: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Exception creating lead:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

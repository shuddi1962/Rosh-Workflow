import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status, next_action, next_action_date, notes } = await request.json()

    const updateData: Record<string, unknown> = {
      last_contact: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (next_action) updateData.next_action = next_action
    if (next_action_date) updateData.next_action_date = next_action_date
    if (notes) updateData.notes = notes

    const { data, error } = await db
      .from('leads')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ lead: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

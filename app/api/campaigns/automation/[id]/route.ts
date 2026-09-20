import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function PUT(_request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await _request.json()
    const { data, error } = await db
      .from('automation_triggers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rule: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await db
      .from('automation_triggers')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

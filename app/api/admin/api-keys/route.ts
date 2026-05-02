import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { encryptApiKey } from '@/lib/env'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET(request: Request) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { data, error } = await db
      .from('api_keys')
      .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, updated_at, created_at')
      .order('service', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ keys: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { service, key_name, value } = await request.json()

    if (!service || !key_name || !value) {
      return NextResponse.json({ error: 'service, key_name, and value are required' }, { status: 400 })
    }

    const encrypted_value = encryptApiKey(value)
    const now = new Date().toISOString()

    const { data: existingKey } = await db
      .from('api_keys')
      .select('id')
      .eq('service', service)
      .eq('key_name', key_name)
      .single()

    if (existingKey) {
      const existing = existingKey as unknown as { id: string }
      const { data, error } = await db
        .from('api_keys')
        .update({ encrypted_value, is_active: true, updated_at: now })
        .eq('id', existing.id)
        .select()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ key: data, updated: true })
    }

    const { data, error } = await db
      .from('api_keys')
      .insert({
        service,
        key_name,
        encrypted_value,
        is_active: true,
        usage_today: 0,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ key: data, created: true }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

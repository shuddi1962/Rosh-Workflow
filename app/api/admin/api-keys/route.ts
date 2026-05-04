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
      .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, usage_all_time, updated_at, created_at')
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const response = NextResponse.json({ keys: data || [] })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { service, key_name, value } = body

    console.log('[API Keys POST] service:', service, 'key_name:', key_name, 'value_present:', !!value)

    if (!service || !key_name || !value) {
      return NextResponse.json({ error: 'service, key_name, and value are required' }, { status: 400 })
    }

    const encrypted_value = encryptApiKey(value)

    // Check for existing key
    const { data: existingKeys, error: selectError } = await db
      .from('api_keys')
      .select('id')
      .eq('service', service)
      .eq('key_name', key_name)
      .limit(1)

    if (selectError) {
      console.error('[API Keys] Select error:', selectError)
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    if (existingKeys && existingKeys.length > 0) {
      const existing = existingKeys[0] as unknown as { id: string }
      console.log('[API Keys] Updating existing key:', existing.id)
      const { data, error } = await db
        .from('api_keys')
        .update({ encrypted_value, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()

      if (error) {
        console.error('[API Keys] Update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      console.log('[API Keys] Updated successfully:', data)
      return NextResponse.json({ key: data?.[0] ?? data, updated: true })
    }

    console.log('[API Keys] Inserting new key')
    const now = new Date().toISOString()
    
    // Try to insert, but if unique constraint violation occurs, update instead
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

    if (error) {
      // Check if it's a unique constraint violation
      const errorMsg = error.message || ''
      if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || (error as any).code === '23505') {
        console.log('[API Keys] Unique constraint violation, updating instead')
        const { data: updateData, error: updateError } = await db
          .from('api_keys')
          .update({ encrypted_value, is_active: true, updated_at: now })
          .eq('service', service)
          .eq('key_name', key_name)
          .select()
          .single()

        if (updateError) {
          console.error('[API Keys] Update after constraint violation error:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        console.log('[API Keys] Updated via constraint violation:', updateData)
        return NextResponse.json({ key: updateData, updated: true })
      }
      
      console.error('[API Keys] Insert error:', error)
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    console.log('[API Keys] Inserted successfully:', data)
    const response = NextResponse.json({ key: data, created: true }, { status: 201 })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[API Keys] POST error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

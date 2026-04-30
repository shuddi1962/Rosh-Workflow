import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { encryptApiKey, decryptApiKey } from '@/lib/env'

const db = new DBClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { key_name, value, is_active } = await request.json()
    
    const updates: Record<string, unknown> = {}
    if (key_name !== undefined) updates.key_name = key_name
    if (is_active !== undefined) updates.is_active = is_active
    if (value) updates.encrypted_value = encryptApiKey(value)
    updates.updated_at = new Date().toISOString()
    
    const { data, error } = await db
      .from('api_keys')
      .update(updates)
      .eq('id', params.id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ key: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await db
      .from('api_keys')
      .delete()
      .eq('id', params.id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: keyData, error: keyError } = await db
      .from('api_keys')
      .select('encrypted_value, service')
      .eq('id', params.id)
      .single()
    
    if (keyError || !keyData) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    
    const keyObj = keyData as unknown as Record<string, unknown>
    const decrypted = decryptApiKey(keyObj.encrypted_value as string)
    
    let testResult = 'unknown'
    if (keyObj.service === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': decrypted, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] })
      })
      testResult = response.ok ? 'success' : 'failed'
    }
    
    await db
      .from('api_keys')
      .update({ last_tested: new Date().toISOString(), last_test_result: testResult })
      .eq('id', params.id)
    
    return NextResponse.json({ result: testResult })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

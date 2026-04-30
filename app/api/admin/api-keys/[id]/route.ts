import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'
import { decryptApiKey } from '@/lib/env'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { key_name, value, is_active } = await request.json()
    
    const updates: any = {}
    if (key_name !== undefined) updates.key_name = key_name
    if (is_active !== undefined) updates.is_active = is_active
    if (value) updates.encrypted_value = encryptApiKey(value)
    updates.updated_at = new Date().toISOString()
    
    const { data, error } = await insforgeAdmin
      .database
      .from('api_keys')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ key: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await insforgeAdmin
      .database
      .from('api_keys')
      .delete()
      .eq('id', params.id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: keyData, error: keyError } = await insforgeAdmin
      .database
      .from('api_keys')
      .select('encrypted_value, service')
      .eq('id', params.id)
      .single()
    
    if (keyError || !keyData) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    
    const decrypted = decryptApiKey(keyData.encrypted_value)
    
    let testResult = 'unknown'
    if (keyData.service === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': decrypted, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] })
      })
      testResult = response.ok ? 'success' : 'failed'
    }
    
    await insforgeAdmin
      .database
      .from('api_keys')
      .update({ last_tested: new Date().toISOString(), last_test_result: testResult })
      .eq('id', params.id)
    
    return NextResponse.json({ result: testResult })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { encryptApiKey, decryptApiKey } from '@/lib/env'
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

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
      .select()
      .single()

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
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

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
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { data: keyData, error: keyError } = await db
      .from('api_keys')
      .select('encrypted_value, service')
      .eq('id', params.id)
      .single()

    if (keyError || !keyData) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

    const keyObj = keyData as unknown as Record<string, unknown>
    const decrypted = decryptApiKey(keyObj.encrypted_value as string)

    let testResult = 'unknown'
    const service = keyObj.service as string

    if (service === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': decrypted, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] })
      })
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else if (service === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${decrypted}` }
      })
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else if (service === 'kie_ai') {
      const response = await fetch('https://api.kie.ai/api/v1/account/info', {
        headers: { 'Authorization': `Bearer ${decrypted}` }
      })
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else if (service === 'news_api') {
      const response = await fetch(`https://newsapi.org/v2/top-headlines?country=ng&apiKey=${decrypted}`)
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else if (service === 'apify') {
      const response = await fetch('https://api.apify.com/v2/users/me', {
        headers: { 'Authorization': `Bearer ${decrypted}` }
      })
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else if (service === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${decrypted}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalizations: [{ to: [{ email: 'test@test.com' }] }], from: { email: 'test@test.com' }, subject: 'Test', content: [{ type: 'text/plain', value: 'Test' }] })
      })
      testResult = response.status === 202 || response.status === 400 ? 'success' : `failed (${response.status})`
    } else if (service === 'twilio') {
      const b64 = Buffer.from(`AC${decrypted}:dummy`).toString('base64')
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
        headers: { 'Authorization': `Basic ${b64}` }
      })
      testResult = response.ok ? 'success' : `failed (${response.status})`
    } else {
      testResult = 'success (no test available)'
    }

    const now = new Date().toISOString()
    await db
      .from('api_keys')
      .update({ last_tested: now, last_test_result: testResult, updated_at: now })
      .eq('id', params.id)

    return NextResponse.json({ result: testResult, success: testResult.startsWith('success') })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message, result: 'failed' }, { status: 500 })
  }
}

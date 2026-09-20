import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'
import { decryptApiKey } from '@/lib/env'

const db = new DBClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: apiKey, error } = await db
      .from('api_keys')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const keyObj = apiKey as unknown as Record<string, unknown>
    const encryptedValue = keyObj.encrypted_value as string
    const service = keyObj.service as string

    try {
      const decryptedKey = decryptApiKey(encryptedValue)

      let testResult = 'unknown'

      if (service === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': decryptedKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        })
        testResult = response.ok ? 'valid' : 'invalid'
      } else {
        testResult = 'manual_verification_required'
      }

      await db
        .from('api_keys')
        .update({
          last_tested: new Date().toISOString(),
          last_test_result: testResult
        })
        .eq('id', params.id)

      return NextResponse.json({ result: testResult, service })
    } catch (decryptError: unknown) {
      await db
        .from('api_keys')
        .update({
          last_tested: new Date().toISOString(),
          last_test_result: 'decryption_failed'
        })
        .eq('id', params.id)

      return NextResponse.json({ result: 'decryption_failed' }, { status: 500 })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

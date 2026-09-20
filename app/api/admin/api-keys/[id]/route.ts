import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { decryptApiKey, encryptApiKey } from '@/lib/env'
import { verifyToken } from '@/lib/auth'
import { testApiKey } from '@/lib/ai/test-key'

const db = new DBClient()

function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'admin') return null
  return user
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { is_active, value } = body

    const updateData: Record<string, unknown> = {}
    if (typeof is_active === 'boolean') updateData.is_active = is_active
    if (value) updateData.encrypted_value = encryptApiKey(value)
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await db
      .from('api_keys')
      .update(updateData)
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { data: keyData, error: fetchError } = await db
      .from('api_keys')
      .select('service, encrypted_value, key_name')
      .eq('id', params.id)
      .single()

    if (fetchError || !keyData) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const apiKey = decryptApiKey((keyData as any).encrypted_value)
    const service = (keyData as any).service
    const keyName = (keyData as any).key_name

    const testResult = await testApiKey(service, apiKey)

    await db
      .from('api_keys')
      .update({
        last_tested: new Date().toISOString(),
        last_test_result: testResult.success ? 'success' : testResult.error || 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    return NextResponse.json({
      result: testResult.success ? 'success' : 'failed',
      error: testResult.error
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

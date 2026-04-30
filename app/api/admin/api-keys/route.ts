import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { encryptApiKey } from '@/lib/env'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('api_keys')
      .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, updated_at')
      .order('service', { ascending: true })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ keys: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { service, key_name, value } = await request.json()
    
    if (!service || !key_name || !value) {
      return NextResponse.json({ error: 'service, key_name, and value are required' }, { status: 400 })
    }
    
    const encrypted_value = encryptApiKey(value)
    
    const { data, error } = await db
      .from('api_keys')
      .insert({ service, key_name, encrypted_value, is_active: true })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ key: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

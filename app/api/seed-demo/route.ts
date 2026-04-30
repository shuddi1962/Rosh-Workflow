import { NextRequest, NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const email = 'demo@roshanalinfotech.com'
  const password = 'demo123456'
  const passwordHash = await bcrypt.hash(password, 12)

  const { data, error } = await insforgeAdmin
    .database
    .from('users')
    .insert({
      id: 'demo-user-001',
      email,
      password_hash: passwordHash,
      full_name: 'Demo User',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      const { error: updateError } = await insforgeAdmin
        .database
        .from('users')
        .update({ password_hash: passwordHash, is_active: true })
        .eq('email', email)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'Demo user updated', email, password: 'demo123456' })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Demo user created', email, password: 'demo123456' })
}

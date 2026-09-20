import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

async function createDemoUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = 'demo@roshanalinfotech.com'
  const password = 'demo123456'
  const passwordHash = await bcrypt.hash(password, 12)

  console.log('Connecting to Supabase...')

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single()

    if (existing) {
      await supabase
        .from('users')
        .update({ password_hash: passwordHash, is_active: true, role: 'admin' })
        .eq('email', email)
      console.log('Demo user updated successfully!')
    } else {
      await supabase.from('users').insert({
        id: crypto.randomUUID(),
        email,
        password_hash: passwordHash,
        full_name: 'Demo User',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      console.log('Demo user created successfully!')
    }
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  }
}

createDemoUser()

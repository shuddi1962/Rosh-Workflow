import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

async function main() {
  const [email, password, fullName, role] = process.argv.slice(2)

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-user.ts <email> <password> [fullName] [role]')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const passwordHash = await bcrypt.hash(password, 12)

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        is_active: true,
        role: role ?? 'admin',
        full_name: fullName ?? 'Admin',
      })
      .eq('email', email)
    if (error) throw new Error(error.message)
    console.log('User password reset successfully:', email)
  } else {
    const { error } = await supabase.from('users').insert({
      id: crypto.randomUUID(),
      email,
      password_hash: passwordHash,
      full_name: fullName ?? 'Admin',
      role: role ?? 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
    console.log('User created successfully:', email)
  }
}

main().catch((e) => {
  console.error('Error:', e instanceof Error ? e.message : e)
  process.exit(1)
})

import { DBClient } from '@/lib/insforge/server'
import bcrypt from 'bcryptjs'

const db = new DBClient()

async function createDemoUser() {
  const email = 'demo@roshanalinfotech.com'
  const password = 'demo123456'
  const passwordHash = await bcrypt.hash(password, 12)

  console.log('Creating demo user...')

  const { data, error } = await db
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
      console.log('Demo user already exists. Updating password...')
      const { error: updateError } = await db
        .from('users')
        .update({ password_hash: passwordHash, is_active: true })
        .eq('email', email)

      if (updateError) {
        console.error('Error updating demo user:', updateError)
        return
      }
      console.log('Demo user password updated successfully!')
    } else {
      console.error('Error creating demo user:', error)
      return
    }
  } else {
    console.log('Demo user created successfully!')
    console.log('Email:', email)
    console.log('Password: demo123456')
  }
}

createDemoUser().catch(console.error)

const { createClient } = require('@insforge/sdk')
const bcrypt = require('bcryptjs')

const insforgeAdmin = createClient({
  baseUrl: 'https://8cftq4jt.us-east.insforge.app',
  anonKey: 'ik_20cf14317b8231a14ae5256b90c842c1',
  isServerMode: true,
})

async function createDemoUser() {
  const email = 'demo@roshanalinfotech.com'
  const password = 'demo123456'
  const passwordHash = await bcrypt.hash(password, 12)

  console.log('Creating demo user in InsForge...')

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
    if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.message?.includes('Conflict')) {
      console.log('User already exists. Updating password...')
      const { error: updateError } = await insforgeAdmin
        .database
        .from('users')
        .update({ password_hash: passwordHash, is_active: true })
        .eq('email', email)

      if (updateError) {
        console.error('Error updating demo user:', updateError)
        process.exit(1)
      }
      console.log('Demo user password updated successfully!')
    } else {
      console.error('Error creating demo user:', error)
      process.exit(1)
    }
  } else {
    console.log('Demo user created successfully!')
  }

  console.log('')
  console.log('===========================================')
  console.log('  DEMO ACCOUNT CREDENTIALS')
  console.log('===========================================')
  console.log('Email:    demo@roshanalinfotech.com')
  console.log('Password: demo123456')
  console.log('===========================================')
}

createDemoUser()

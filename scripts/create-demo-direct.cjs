const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const DATABASE_URL = 'postgresql://postgres:6b9a0086e3afa42e8232ba155e21ae20@8cftq4jt.us-east.database.insforge.app:5432/insforge?sslmode=require'

async function createDemoUser() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to InsForge database')

    // Check tables
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('\nTables found:')
    tables.forEach(t => console.log('  -', t.table_name))

    // Check users table columns
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    console.log('\nUsers table columns:')
    columns.forEach(c => console.log('  -', c.column_name, `(${c.data_type})`))

    // Check existing users
    const { rows: existingUsers } = await client.query(`
      SELECT id, email, full_name, role, is_active FROM users
    `)
    console.log('\nExisting users:', existingUsers.length)
    existingUsers.forEach(u => console.log('  -', u.email, `(${u.role})`))

    // Create demo user
    const email = 'demo@roshanalinfotech.com'
    const password = 'demo123456'
    const passwordHash = await bcrypt.hash(password, 12)

    // Check if user already exists
    const { rows: existingDemo } = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    )

    if (existingDemo.length > 0) {
      console.log('\nDemo user already exists. Updating password...')
      await client.query(
        'UPDATE users SET password_hash = $1, is_active = true WHERE email = $2',
        [passwordHash, email]
      )
      console.log('Password updated successfully!')
    } else {
      console.log('\nCreating demo user...')
      const uuid = require('crypto').randomUUID()
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, last_login) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [uuid, email, passwordHash, 'Demo User', 'admin', true]
      )
      console.log('Demo user created successfully!')
    }

    // Verify
    const { rows: verifyDemo } = await client.query(
      'SELECT id, email, full_name, role, is_active FROM users WHERE email = $1',
      [email]
    )
    console.log('\n===========================================')
    console.log('  DEMO ACCOUNT CREATED')
    console.log('===========================================')
    console.log('Email:    demo@roshanalinfotech.com')
    console.log('Password: demo123456')
    console.log('Role:    ', verifyDemo[0].role)
    console.log('Active:  ', verifyDemo[0].is_active)
    console.log('===========================================')

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
    console.log('\nDatabase connection closed')
  }
}

createDemoUser()

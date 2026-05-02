import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

async function testLogin() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  const email = 'demo@roshanalinfotech.com'
  const password = 'demo123456'

  try {
    console.log('Fetching user from database...')
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (rows.length === 0) {
      console.log('ERROR: User not found!')
      return
    }

    const user = rows[0]
    console.log('User found:', { id: user.id, email: user.email, role: user.role, is_active: user.is_active })
    console.log('Password hash length:', user.password_hash?.length)

    console.log('\nVerifying password...')
    const valid = await bcrypt.compare(password, user.password_hash)
    console.log('Password valid:', valid)

    if (!valid) {
      console.log('\nTrying to create new hash and compare...')
      const newHash = await bcrypt.hash(password, 12)
      console.log('New hash created')
      const validNew = await bcrypt.compare(password, newHash)
      console.log('New hash valid:', validNew)
      
      // Update password hash
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, email])
      console.log('Password hash updated in database')
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  } finally {
    await pool.end()
  }
}

testLogin()

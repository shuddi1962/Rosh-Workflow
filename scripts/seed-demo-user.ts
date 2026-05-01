import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

async function createDemoUser() {
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
  const passwordHash = await bcrypt.hash(password, 12)

  console.log('Connecting to database...')

  try {
    const { rows } = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email])

    if (rows.length > 0) {
      await pool.query(
        'UPDATE users SET password_hash = $2, is_active = true, role = $3 WHERE email = $1',
        [email, passwordHash, 'admin']
      )
      console.log('Demo user updated successfully!')
    } else {
      await pool.query(
        'INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, last_login) VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())',
        [email, passwordHash, 'Demo User', 'admin']
      )
      console.log('Demo user created successfully!')
    }
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
  } finally {
    await pool.end()
  }
}

createDemoUser()

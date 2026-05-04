const { Pool } = require('pg')
const fs = require('fs')

const pool = new Pool({
  host: '8cftq4jt.us-east.database.insforge.app',
  port: 5432,
  database: 'insforge',
  user: 'postgres',
  password: '6b9a0086e3afa42e8232ba155e21ae20',
  ssl: { rejectUnauthorized: false }
})

async function applyMigration() {
  try {
    const sql = fs.readFileSync('.insforge/002_expansion_tables.sql', 'utf8')
    await pool.query(sql)
    console.log('Migration 2 applied successfully')
  } catch (err) {
    console.error('Migration Error:', err.message)
  } finally {
    await pool.end()
  }
}

applyMigration()

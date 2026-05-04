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

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('Existing tables:')
    result.rows.forEach(row => {
      console.log('- ' + row.table_name)
    })
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await pool.end()
  }
}

checkTables()

const { Pool } = require('pg')

const pool = new Pool({
  host: '8cftq4jt.us-east.database.insforge.app',
  port: 5432,
  database: 'insforge',
  user: 'postgres',
  password: '6b9a0086e3afa42e8232ba155e21ae20',
  ssl: { rejectUnauthorized: false }
})

async function check() {
  try {
    console.log('=== API_KEYS TABLE ===')
    const keysResult = await pool.query(`SELECT id, service, key_name, is_active, created_at FROM api_keys ORDER BY updated_at DESC`)
    console.log(JSON.stringify(keysResult.rows, null, 2))
    
    console.log('\n=== SOCIAL_POSTS COLUMNS ===')
    const colsResult = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'social_posts' ORDER BY ordinal_position`)
    console.log(JSON.stringify(colsResult.rows, null, 2))
    
    console.log('\n=== SOCIAL_POSTS COUNT ===')
    const countResult = await pool.query(`SELECT COUNT(*) FROM social_posts`)
    console.log(countResult.rows[0].count)
    
    console.log('\n=== TRENDS COUNT ===')
    const trendsResult = await pool.query(`SELECT COUNT(*) FROM trends WHERE status = 'active'`)
    console.log(trendsResult.rows[0].count)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await pool.end()
  }
}

check()

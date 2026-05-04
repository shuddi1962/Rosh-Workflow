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
    const result = await pool.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'trends' ORDER BY ordinal_position`)
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (e) {
    console.error(e.message)
  } finally {
    pool.end()
  }
}

check()

const bcrypt = require('bcryptjs')

const storedHash = '$2b$12$kqh/AvNQ05ktdl.oXHi87e....'

const client = new (require('pg').Client)({
  host: '8cftq4jt.us-east.database.insforge.app',
  port: 5432,
  database: 'insforge',
  user: 'postgres',
  password: '6b9a0086e3afa42e8232ba155e21ae20',
  ssl: { rejectUnauthorized: false }
})

async function testPassword() {
  try {
    await client.connect()
    const { rows } = await client.query(`
      SELECT password_hash FROM users WHERE email = 'demo@roshanalinfotech.com'
    `)
    const hash = rows[0].password_hash
    console.log('Full hash:', hash)
    
    const isValid = await bcrypt.compare('demo123456', hash)
    console.log('Password valid:', isValid)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

testPassword()

const { Client } = require('pg')

async function checkUser() {
  const client = new Client({
    host: '8cftq4jt.us-east.database.insforge.app',
    port: 5432,
    database: 'insforge',
    user: 'postgres',
    password: '6b9a0086e3afa42e8232ba155e21ae20',
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    const { rows } = await client.query(`
      SELECT id, email, password_hash, full_name, role, is_active FROM users
    `)
    console.log('Users in database:')
    rows.forEach(u => {
      console.log('  Email:', u.email)
      console.log('  Role:', u.role)
      console.log('  Active:', u.is_active)
      console.log('  Hash:', u.password_hash.substring(0, 30) + '...')
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

checkUser()

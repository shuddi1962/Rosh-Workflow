async function testEndpoints() {
  const apiKey = 'ik_20cf14317b8231a14ae5256b90c842c1'
  const baseUrl = 'https://8cftq4jt.us-east.insforge.app'
  
  const endpoints = [
    '/database/v1/objects/users',
    '/rest/v1/users',
    '/api/database/v1/users',
    '/api/v1/users',
    '/api/rest/v1/users',
    '/rest/users'
  ]
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`)
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })
      console.log('  Status:', res.status)
      const text = await res.text()
      if (text.length < 200) {
        console.log('  Response:', text.substring(0, 200))
      } else {
        console.log('  Response (truncated):', text.substring(0, 100))
      }
    } catch (error) {
      console.error('  Error:', error.message)
    }
  }
}

testEndpoints()

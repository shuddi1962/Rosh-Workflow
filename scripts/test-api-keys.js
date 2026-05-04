const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testApiKeys() {
  try {
    console.log('Testing API key routes...\n')
    
    const token = 'test-token'
    
    console.log('1. Testing GET /api/admin/api-keys')
    try {
      const getRes = await axios.get(`${BASE_URL}/api/admin/api-keys`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('   Status:', getRes.status)
      console.log('   Keys count:', getRes.data.keys?.length || 0)
    } catch (err) {
      console.log('   Error:', err.response?.status, err.response?.data?.error || err.message)
    }
    
    console.log('\n2. Testing POST /api/admin/api-keys (create key)')
    try {
      const postRes = await axios.post(`${BASE_URL}/api/admin/api-keys`, {
        service: 'test_service',
        key_name: 'Test Key',
        value: 'test-api-key-12345'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('   Status:', postRes.status)
      console.log('   Created:', !!postRes.data.key)
      
      if (postRes.data.key?.id) {
        const keyId = postRes.data.key.id
        
        console.log('\n3. Testing POST /api/admin/api-keys/[id] (test key)')
        try {
          const testRes = await axios.post(`${BASE_URL}/api/admin/api-keys/${keyId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('   Status:', testRes.status)
          console.log('   Result:', testRes.data.result || testRes.data.error)
        } catch (err) {
          console.log('   Expected error (test service):', err.response?.status)
        }
        
        console.log('\n4. Testing PUT /api/admin/api-keys/[id] (update key)')
        try {
          const putRes = await axios.put(`${BASE_URL}/api/admin/api-keys/${keyId}`, {
            is_active: false
          }, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('   Status:', putRes.status)
          console.log('   Updated:', !!putRes.data.key)
        } catch (err) {
          console.log('   Error:', err.response?.status, err.response?.data?.error || err.message)
        }
        
        console.log('\n5. Testing DELETE /api/admin/api-keys/[id]')
        try {
          const delRes = await axios.delete(`${BASE_URL}/api/admin/api-keys/${keyId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('   Status:', delRes.status)
          console.log('   Deleted:', !!delRes.data.success)
        } catch (err) {
          console.log('   Error:', err.response?.status, err.response?.data?.error || err.message)
        }
      }
    } catch (err) {
      console.log('   Error:', err.response?.status, err.response?.data?.error || err.message)
    }
    
    console.log('\n✓ API key route tests completed!')
  } catch (err) {
    console.error('Test error:', err.message)
  }
}

testApiKeys()

'use client'

import { useState } from 'react'

interface ApiKey {
  id: string
  service: string
  key_name: string
  is_active: boolean
  last_tested?: string
  last_test_result?: string
  usage_today: number
  updated_at: string
  created_at?: string
}

const SERVICE_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openrouter: 'OpenRouter (Multi-Model)',
  kie_ai: 'Kie.ai (Video/Image Gen)',
  apify: 'Apify',
  news_api: 'News API',
  google_maps: 'Google Maps',
  meta: 'Meta (FB/IG/WhatsApp)',
  sendgrid: 'SendGrid',
  twilio: 'Twilio',
}

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function refreshKeys() {
    setRefreshing(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/admin/api-keys', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      showToast(`Refresh failed: ${message}`, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  async function testKey(id: string) {
    setTesting(prev => ({ ...prev, [id]: true }))
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.error) {
        showToast(`Test failed: ${data.error}`, 'error')
      } else {
        const resultText = data.result === 'success' ? '✓ Test passed' : `✗ ${data.result}`
        showToast(resultText, data.result === 'success' ? 'success' : 'error')
        await refreshKeys()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      showToast(`Test failed: ${message}`, 'error')
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }))
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.error) {
        showToast(`Delete failed: ${data.error}`, 'error')
      } else {
        showToast('API key deleted', 'success')
        await refreshKeys()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      showToast(`Delete failed: ${message}`, 'error')
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentActive }),
      })
      const data = await res.json()
      if (data.error) {
        showToast(`Update failed: ${data.error}`, 'error')
      } else {
        showToast(currentActive ? 'Key deactivated' : 'Key activated', 'success')
        await refreshKeys()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      showToast(`Update failed: ${message}`, 'error')
    }
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-clash font-bold text-gray-900">API Key Management</h1>
          <p className="text-sm text-gray-500 mt-1">All keys are encrypted at rest with AES-256-GCM</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshKeys}
            disabled={refreshing}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <a href="/admin/api-keys/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Add Key
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Service</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Key Name</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Last Test</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Result</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Usage Today</th>
              <th className="text-left p-4 text-gray-600 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{SERVICE_LABELS[key.service] || key.service}</td>
                <td className="p-4 text-gray-700">{key.key_name}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(key.id, key.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      key.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {key.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  {key.last_tested ? new Date(key.last_tested).toLocaleString() : 'Never'}
                </td>
                <td className="p-4">
                  {key.last_test_result && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      key.last_test_result?.startsWith('success')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {key.last_test_result}
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-700">{key.usage_today}</td>
                <td className="p-4 space-x-3">
                  <button
                    onClick={() => testKey(key.id)}
                    disabled={testing[key.id]}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                  >
                    {testing[key.id] ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {keys.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No API keys configured yet.</p>
            <a href="/admin/api-keys/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              + Add Your First Key
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

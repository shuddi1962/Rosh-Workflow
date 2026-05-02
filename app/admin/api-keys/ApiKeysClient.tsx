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
  anthropic: 'Anthropic (Claude AI)',
  openrouter: 'OpenRouter (Multi-Model)',
  openai: 'OpenAI (GPT)',
  pollinations: 'Pollinations.ai (Free Images)',
  kie_ai: 'Kie.ai (Video/Image)',
  apify: 'Apify (Web Scraping)',
  news_api: 'News API',
  google_trends: 'Google Trends',
  google_maps: 'Google Maps',
  meta: 'Meta (FB/IG/WhatsApp)',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  sendgrid: 'SendGrid (Email)',
  twilio: 'Twilio (SMS/Voice)',
  elevenlabs: 'ElevenLabs (Voice AI)',
  vercel_blob: 'Vercel Blob Storage',
}

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null

  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  if (userRole !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Admin Access Required</h2>
          <p className="text-red-700 mb-4">Only administrators can view and manage API keys.</p>
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700 max-w-md mx-auto">
            <p className="font-medium mb-2">Current login:</p>
            <p><span className="text-gray-500">Name:</span> {userName || 'Unknown'}</p>
            <p><span className="text-gray-500">Role:</span> <span className="text-red-600 font-medium">{userRole || 'Not logged in'}</span></p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Switch to Admin Account</a>
          </div>
        </div>
      </div>
    )
  }

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

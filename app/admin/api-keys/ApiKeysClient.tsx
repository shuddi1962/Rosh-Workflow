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
}

const SERVICE_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
  openrouter: 'OpenRouter (Multi-Model)',
  kie_ai: 'Kie.ai (Video/Image Gen)',
  apify: 'Apify',
  news_api: 'News API',
  google_trends: 'Google Trends',
  meta: 'Meta (Facebook/Instagram/WhatsApp)',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  sendgrid: 'SendGrid',
  twilio: 'Twilio',
  google_maps: 'Google Maps',
}

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  async function testKey(id: string) {
    setTesting(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        alert(`Test failed: ${data.error}`)
      } else {
        alert(`Test result: ${data.result}`)
        // Refresh keys
        const refreshRes = await fetch('/api/admin/api-keys')
        const refreshData = await refreshRes.json()
        setKeys(refreshData.keys || [])
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Test failed: ${message}`)
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }))
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) return
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) {
        alert(`Delete failed: ${data.error}`)
      } else {
        setKeys(keys.filter(k => k.id !== id))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Delete failed: ${message}`)
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Update failed: ${data.error}`)
      } else {
        setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentActive } : k))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Update failed: ${message}`)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">API Key Management</h1>
        <a href="/admin/api-keys/new" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Add Key</a>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-elevated">
            <tr>
              <th className="text-left p-4 text-text-secondary text-sm">Service</th>
              <th className="text-left p-4 text-text-secondary text-sm">Key Name</th>
              <th className="text-left p-4 text-text-secondary text-sm">Status</th>
              <th className="text-left p-4 text-text-secondary text-sm">Last Test</th>
              <th className="text-left p-4 text-text-secondary text-sm">Result</th>
              <th className="text-left p-4 text-text-secondary text-sm">Usage Today</th>
              <th className="text-left p-4 text-text-secondary text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-t border-border-subtle">
                <td className="p-4 text-text-primary">{SERVICE_LABELS[key.service] || key.service}</td>
                <td className="p-4 text-text-secondary">{key.key_name}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(key.id, key.is_active)}
                    className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                      key.is_active
                        ? 'bg-status-live/20 text-status-live'
                        : 'bg-status-draft/20 text-status-draft'
                    }`}
                  >
                    {key.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-text-muted text-sm">
                  {key.last_tested ? new Date(key.last_tested).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-4">
                  {key.last_test_result && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      key.last_test_result === 'success'
                        ? 'bg-status-live/20 text-status-live'
                        : 'bg-status-failed/20 text-status-failed'
                    }`}>
                      {key.last_test_result}
                    </span>
                  )}
                </td>
                <td className="p-4 text-text-secondary">{key.usage_today}</td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => testKey(key.id)}
                    disabled={testing[key.id]}
                    className="text-accent-primary hover:underline disabled:opacity-50"
                  >
                    {testing[key.id] ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="text-accent-red hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {keys.length === 0 && (
          <p className="p-8 text-text-muted text-center">No API keys configured yet.</p>
        )}
      </div>
    </div>
  )
}

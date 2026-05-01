'use client'

import { useState } from 'react'

const SERVICE_CONFIG: Record<string, { label: string; url: string; placeholder: string }> = {
  anthropic: {
    label: 'Anthropic (Claude)',
    url: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-api03-...'
  },
  openai: {
    label: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...'
  },
  openrouter: {
    label: 'OpenRouter (Multi-Model)',
    url: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...'
  },
  kie_ai: {
    label: 'Kie.ai (Video/Image Gen)',
    url: 'https://kie.ai/dashboard/api-keys',
    placeholder: 'kie_...'
  },
  apify: {
    label: 'Apify',
    url: 'https://console.apify.com/settings/integrations',
    placeholder: 'apify_api_...'
  },
  news_api: {
    label: 'News API',
    url: 'https://newsapi.org/account',
    placeholder: '...'
  },
  google_trends: {
    label: 'Google Trends',
    url: 'https://developers.google.com/custom-search/v1/overview',
    placeholder: 'AIzaSy...'
  },
  meta: {
    label: 'Meta (Facebook/Instagram/WhatsApp)',
    url: 'https://developers.facebook.com/apps/',
    placeholder: 'App ID: ..., App Secret: ..., or Access Token: ...'
  },
  twitter: {
    label: 'Twitter/X',
    url: 'https://developer.twitter.com/en/portal/dashboard',
    placeholder: 'API Key: ..., API Secret: ..., or Bearer Token: ...'
  },
  linkedin: {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/developers/apps',
    placeholder: 'Client ID: ..., Client Secret: ...'
  },
  sendgrid: {
    label: 'SendGrid',
    url: 'https://app.sendgrid.com/settings/api_keys',
    placeholder: 'SG....'
  },
  twilio: {
    label: 'Twilio',
    url: 'https://www.twilio.com/console',
    placeholder: 'SID: AC..., Auth Token: ...'
  },
  google_maps: {
    label: 'Google Maps',
    url: 'https://console.cloud.google.com/apis/credentials',
    placeholder: 'AIzaSy...'
  },
}

export default function AdminApiKeyNewPage() {
  const [selectedService, setSelectedService] = useState('')
  const [keyName, setKeyName] = useState('')
  const [keyValue, setKeyValue] = useState('')

  const config = selectedService ? SERVICE_CONFIG[selectedService] : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !keyName || !keyValue) {
      alert('Please fill in all fields')
      return
    }

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService, key_name: keyName, value: keyValue }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert('API key saved successfully!')
        window.location.href = '/admin/api-keys'
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-6">Add New API Key</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Service</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a service...</option>
            {Object.entries(SERVICE_CONFIG).map(([value, cfg]) => (
              <option key={value} value={value}>{cfg.label}</option>
            ))}
          </select>
          {config && (
            <a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Get your {config.label} API key →
            </a>
          )}
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Key Name</label>
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g., Production Key"
            required
            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">API Key Value</label>
          <input
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder={config ? config.placeholder : 'Enter API key (will be encrypted)'}
            required
            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedService === 'meta' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">Meta API Keys Info:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>App ID:</strong> Found in App Settings</li>
                <li><strong>App Secret:</strong> Found in App Settings → Basic</li>
                <li><strong>WhatsApp Phone Number ID:</strong> Found in WhatsApp → API Setup</li>
                <li><strong>WhatsApp Access Token:</strong> Found in WhatsApp → API Setup → Temporary access token</li>
              </ul>
            </div>
          )}
          {selectedService === 'twitter' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">Twitter API Keys Info:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>API Key:</strong> Found in App → Keys and tokens</li>
                <li><strong>API Secret:</strong> Found in App → Keys and tokens</li>
                <li><strong>Access Token:</strong> Found in App → Keys and tokens</li>
                <li><strong>Access Token Secret:</strong> Found in App → Keys and tokens</li>
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Save Encrypted Key
        </button>
      </form>
    </div>
  )
}

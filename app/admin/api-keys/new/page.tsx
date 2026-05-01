'use client'

import { useState } from 'react'

const SERVICE_CONFIG: Record<string, {
  label: string
  url: string
  fields: { name: string; placeholder: string; key_name: string }[]
}> = {
  anthropic: {
    label: 'Anthropic (Claude)',
    url: 'https://console.anthropic.com/settings/keys',
    fields: [
      { name: 'API Key', placeholder: 'sk-ant-api03-...', key_name: 'API Key' }
    ]
  },
  openai: {
    label: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    fields: [
      { name: 'API Key', placeholder: 'sk-...', key_name: 'API Key' }
    ]
  },
  openrouter: {
    label: 'OpenRouter (Multi-Model)',
    url: 'https://openrouter.ai/keys',
    fields: [
      { name: 'API Key', placeholder: 'sk-or-v1-...', key_name: 'API Key' }
    ]
  },
  kie_ai: {
    label: 'Kie.ai (Video/Image Gen)',
    url: 'https://kie.ai/dashboard/api-keys',
    fields: [
      { name: 'API Key', placeholder: 'kie_...', key_name: 'API Key' }
    ]
  },
  apify: {
    label: 'Apify',
    url: 'https://console.apify.com/settings/integrations',
    fields: [
      { name: 'API Token', placeholder: 'apify_api_...', key_name: 'API Token' }
    ]
  },
  news_api: {
    label: 'News API',
    url: 'https://newsapi.org/account',
    fields: [
      { name: 'API Key', placeholder: 'Enter your News API key', key_name: 'API Key' }
    ]
  },
  google_trends: {
    label: 'Google Trends',
    url: 'https://developers.google.com/custom-search/v1/overview',
    fields: [
      { name: 'API Key', placeholder: 'AIzaSy...', key_name: 'API Key' }
    ]
  },
  meta: {
    label: 'Meta (Facebook/Instagram/WhatsApp)',
    url: 'https://developers.facebook.com/apps/',
    fields: [
      { name: 'App ID', placeholder: 'e.g., 123456789012345', key_name: 'App ID' },
      { name: 'App Secret', placeholder: 'e.g., abc123def456...', key_name: 'App Secret' },
      { name: 'WhatsApp Phone Number ID', placeholder: 'e.g., 123456789', key_name: 'WhatsApp Phone Number ID' },
      { name: 'WhatsApp Access Token', placeholder: 'EAAB... (temporary or permanent)', key_name: 'WhatsApp Access Token' },
      { name: 'WhatsApp Business Account ID', placeholder: 'e.g., 987654321', key_name: 'WhatsApp Business Account ID' },
    ]
  },
  twitter: {
    label: 'Twitter/X',
    url: 'https://developer.twitter.com/en/portal/dashboard',
    fields: [
      { name: 'API Key', placeholder: 'e.g., abc123def456...', key_name: 'API Key' },
      { name: 'API Secret', placeholder: 'e.g., xyz789uvw012...', key_name: 'API Secret' },
      { name: 'Access Token', placeholder: 'e.g., 123456789-abc...', key_name: 'Access Token' },
      { name: 'Access Token Secret', placeholder: 'e.g., lmn345opq678...', key_name: 'Access Token Secret' },
    ]
  },
  linkedin: {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/developers/apps',
    fields: [
      { name: 'Client ID', placeholder: 'e.g., 86a...', key_name: 'Client ID' },
      { name: 'Client Secret', placeholder: 'e.g., Rb0...', key_name: 'Client Secret' },
    ]
  },
  sendgrid: {
    label: 'SendGrid',
    url: 'https://app.sendgrid.com/settings/api_keys',
    fields: [
      { name: 'API Key', placeholder: 'SG....', key_name: 'API Key' }
    ]
  },
  twilio: {
    label: 'Twilio',
    url: 'https://www.twilio.com/console',
    fields: [
      { name: 'Account SID', placeholder: 'AC...', key_name: 'Account SID' },
      { name: 'Auth Token', placeholder: 'e.g., 1234567890abcdef...', key_name: 'Auth Token' },
    ]
  },
  google_maps: {
    label: 'Google Maps',
    url: 'https://console.cloud.google.com/apis/credentials',
    fields: [
      { name: 'API Key', placeholder: 'AIzaSy...', key_name: 'API Key' }
    ]
  },
}

export default function AdminApiKeyNewPage() {
  const [selectedService, setSelectedService] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const config = selectedService ? SERVICE_CONFIG[selectedService] : null

  function handleFieldChange(keyName: string, value: string) {
    setFieldValues(prev => ({ ...prev, [keyName]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !config) return

    const missingFields = config.fields.filter(f => !fieldValues[f.key_name])
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    try {
      for (const field of config.fields) {
        const value = fieldValues[field.key_name]
        if (!value) continue

        const res = await fetch('/api/admin/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: selectedService,
            key_name: field.key_name,
            value: value
          }),
        })
        const data = await res.json()
        if (data.error) {
          alert(`Error saving ${field.name}: ${data.error}`)
          setIsSubmitting(false)
          return
        }
      }
      alert('All API keys saved successfully!')
      window.location.href = '/admin/api-keys'
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    } finally {
      setIsSubmitting(false)
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
            onChange={(e) => {
              setSelectedService(e.target.value)
              setFieldValues({})
            }}
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
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-500 rounded-lg font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Get {config.label} API Key
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {config && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Credentials</h3>
            {config.fields.map((field) => (
              <div key={field.key_name}>
                <label className="block text-gray-700 mb-2 font-medium">{field.name}</label>
                <input
                  type="password"
                  value={fieldValues[field.key_name] || ''}
                  onChange={(e) => handleFieldChange(field.key_name, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedService}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Encrypted Keys'}
        </button>
      </form>
    </div>
  )
}

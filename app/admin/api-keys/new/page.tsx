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
  google_maps: {
    label: 'Google Maps',
    url: 'https://console.cloud.google.com/apis/credentials',
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
}

export default function AdminApiKeyNewPage() {
  const [selectedService, setSelectedService] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [totalFields, setTotalFields] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const config = selectedService ? SERVICE_CONFIG[selectedService] : null

  function handleFieldChange(keyName: string, value: string) {
    setFieldValues(prev => ({ ...prev, [keyName]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !config) return

    const missingFields = config.fields.filter(f => !fieldValues[f.key_name])
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)
    setSavedCount(0)
    setTotalFields(config.fields.length)

    try {
      const token = localStorage.getItem('accessToken')

      for (const field of config.fields) {
        const value = fieldValues[field.key_name]
        if (!value) continue

        const res = await fetch('/api/admin/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            service: selectedService,
            key_name: field.key_name,
            value: value
          }),
        })
        const data = await res.json()
        if (data.error) {
          setError(`Error saving ${field.name}: ${data.error}`)
          setIsSubmitting(false)
          return
        }
        setSavedCount(prev => prev + 1)
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/admin/api-keys'
      }, 1500)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setError(`Error: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/api-keys" className="text-gray-500 hover:text-gray-700">
          ← Back
        </a>
        <h1 className="text-3xl font-clash font-bold text-gray-900">Add New API Key</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Service</label>
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value)
              setFieldValues({})
              setError('')
              setSuccess(false)
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
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
              <a
                href={config.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-white hover:text-blue-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-base">Get {config.label} API Key</p>
                    <p className="text-sm text-blue-100">Click here to generate your API credentials →</p>
                  </div>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ All {savedCount} API keys saved successfully! Redirecting...
          </div>
        )}

        {isSubmitting && savedCount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            Saving {savedCount}/{totalFields} keys...
          </div>
        )}

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
          {isSubmitting ? `Saving... (${savedCount}/${totalFields})` : 'Save Encrypted Keys'}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface ServiceField {
  name: string
  placeholder: string
  key_name: string
  required?: boolean
}

interface ServiceConfig {
  label: string
  url: string
  fields: ServiceField[]
  instructions: string[]
  category: 'ai' | 'social' | 'communication' | 'data' | 'storage'
}

const SERVICE_CONFIG: Record<string, ServiceConfig> = {
  anthropic: {
    label: 'Anthropic (Claude AI)',
    url: 'https://console.anthropic.com/settings/keys',
    category: 'ai',
    fields: [
      { name: 'API Key', placeholder: 'sk-ant-api03-...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://console.anthropic.com/ and sign in or create an account',
      'Click "Settings" in the left sidebar, then "API Keys"',
      'Click "Create Key" and give it a name (e.g., "Roshanal")',
      'Copy the key immediately — it starts with "sk-ant-api03-"',
      'Paste it below. This key is used for AI content generation',
      'Free tier: 5,000 tokens/day. Paid plans start at $15/month'
    ]
  },
  openrouter: {
    label: 'OpenRouter (Multi-Model AI)',
    url: 'https://openrouter.ai/keys',
    category: 'ai',
    fields: [
      { name: 'API Key', placeholder: 'sk-or-v1-...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://openrouter.ai/ and sign in with Google or GitHub',
      'Click your profile icon → "Keys"',
      'Click "Create Key" and name it (e.g., "Roshanal Content AI")',
      'Copy the key — it starts with "sk-or-v1-"',
      'This gives access to Claude, GPT-4, Llama, and 100+ models',
      'Free tier available. Pay per token — much cheaper than direct APIs'
    ]
  },
  openai: {
    label: 'OpenAI (GPT)',
    url: 'https://platform.openai.com/api-keys',
    category: 'ai',
    fields: [
      { name: 'API Key', placeholder: 'sk-proj-...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://platform.openai.com/ and sign in or create an account',
      'Click your profile icon → "View API Keys"',
      'Click "Create new secret key"',
      'Name it (e.g., "Roshanal") and copy the key starting with "sk-proj-"',
      'Add a payment method — OpenAI requires it even for free credits',
      'Used for GPT-4 content generation and image creation (DALL-E)'
    ]
  },
  pollinations: {
    label: 'Pollinations.ai (Free Image Gen)',
    url: 'https://pollinations.ai/',
    category: 'ai',
    fields: [
      { name: 'No API Key Required', placeholder: 'This service is 100% free', key_name: 'status', required: false }
    ],
    instructions: [
      'Pollinations.ai is completely FREE — no API key or signup needed',
      'Images are generated via simple URL: https://image.pollinations.ai/prompt/YOUR_PROMPT',
      'Already integrated into the Content Brain — click the image icon on any idea',
      'Supports 1024x1024, realistic, artistic, and custom styles',
      'No rate limits. No credit card. No account required.',
      'This entry is for tracking — just save it as "active"'
    ]
  },
  kie_ai: {
    label: 'Kie.ai (Video/Image Generation)',
    url: 'https://kie.ai/dashboard/api-keys',
    category: 'ai',
    fields: [
      { name: 'API Key', placeholder: 'kie_...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://kie.ai/ and create an account',
      'Navigate to Dashboard → API Keys',
      'Click "Generate New Key" and copy it (starts with "kie_")',
      'Used for advanced AI video and image generation',
      'Check pricing on their dashboard — varies by model',
      'Supports Sora, Runway, and other video generation models'
    ]
  },
  apify: {
    label: 'Apify (Web Scraping)',
    url: 'https://console.apify.com/settings/integrations',
    category: 'data',
    fields: [
      { name: 'API Token', placeholder: 'apify_api_...', key_name: 'API Token' }
    ],
    instructions: [
      'Go to https://console.apify.com/ and sign up',
      'Click your profile icon → "Settings" → "Integrations"',
      'Copy your API Token (starts with "apify_api_")',
      'Used for scraping competitor data, Google Maps leads, LinkedIn profiles',
      'Free tier: $5/month credit. Sufficient for light scraping',
      'Install actors like "google-maps-scraper" for lead generation'
    ]
  },
  news_api: {
    label: 'News API',
    url: 'https://newsapi.org/register',
    category: 'data',
    fields: [
      { name: 'API Key', placeholder: 'Enter your News API key', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://newsapi.org/register and create a free account',
      'Fill in your details (name, email, website)',
      'Your API key will be shown immediately after registration',
      'Also available in your account dashboard under "Your API Key"',
      'Free tier: 100 requests/day — enough for trend monitoring',
      'Used for fetching Nigerian business and security news trends'
    ]
  },
  google_trends: {
    label: 'Google Trends (via Google Custom Search)',
    url: 'https://developers.google.com/custom-search/v1/overview',
    category: 'data',
    fields: [
      { name: 'API Key', placeholder: 'AIzaSy...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://console.cloud.google.com/ and create a project (or use existing)',
      'Enable "Custom Search API" in APIs & Services → Library',
      'Go to Credentials → Create Credentials → API Key',
      'Copy the key (starts with "AIzaSy")',
      'For full Google Trends data, also create a Custom Search Engine at https://cse.google.com/',
      'Used for trending topic detection in Nigerian market'
    ]
  },
  google_maps: {
    label: 'Google Maps Platform',
    url: 'https://console.cloud.google.com/apis/credentials',
    category: 'data',
    fields: [
      { name: 'API Key', placeholder: 'AIzaSy...', key_name: 'API Key' }
    ],
    instructions: [
      'Go to https://console.cloud.google.com/ and select your project',
      'Enable "Maps JavaScript API" and "Places API"',
      'Go to Credentials → Create Credentials → API Key',
      'Copy the key (starts with "AIzaSy")',
      'Used for lead scraping — finding businesses on Google Maps in Port Harcourt',
      'Free tier: $200/month credit (generous for most use cases)'
    ]
  },
  meta: {
    label: 'Meta (Facebook / Instagram / WhatsApp)',
    url: 'https://developers.facebook.com/apps/',
    category: 'social',
    fields: [
      { name: 'App ID', placeholder: 'e.g., 123456789012345', key_name: 'App ID' },
      { name: 'App Secret', placeholder: 'e.g., abc123def456...', key_name: 'App Secret' },
      { name: 'WhatsApp Phone Number ID', placeholder: 'e.g., 123456789', key_name: 'WhatsApp Phone Number ID' },
      { name: 'WhatsApp Access Token', placeholder: 'EAAB... (temporary or permanent)', key_name: 'WhatsApp Access Token' },
      { name: 'WhatsApp Business Account ID', placeholder: 'e.g., 987654321', key_name: 'WhatsApp Business Account ID' },
    ],
    instructions: [
      'STEP 1: Go to https://developers.facebook.com/ and create a developer account',
      'STEP 2: Create a new App → Select "Business" type',
      'STEP 3: Your App ID and App Secret are in the app dashboard',
      'STEP 4: Add "WhatsApp" product to your app from the dashboard',
      'STEP 5: Go to WhatsApp → API Setup → find your Phone Number ID',
      'STEP 6: Generate a temporary token (valid 24hrs) or permanent token (via OAuth)',
      'STEP 7: For permanent tokens, set up OAuth with your Facebook Business account',
      'STEP 8: Business Account ID is found in WhatsApp → Settings → Business Account',
      'Note: WhatsApp Business API requires a verified Facebook Business Manager account'
    ]
  },
  twitter: {
    label: 'Twitter / X API',
    url: 'https://developer.twitter.com/en/portal/dashboard',
    category: 'social',
    fields: [
      { name: 'API Key', placeholder: 'e.g., abc123def456...', key_name: 'API Key' },
      { name: 'API Secret', placeholder: 'e.g., xyz789uvw012...', key_name: 'API Secret' },
      { name: 'Access Token', placeholder: 'e.g., 123456789-abc...', key_name: 'Access Token' },
      { name: 'Access Token Secret', placeholder: 'e.g., lmn345opq678...', key_name: 'Access Token Secret' },
    ],
    instructions: [
      'STEP 1: Go to https://developer.twitter.com/ and sign in with your X account',
      'STEP 2: Apply for a developer account — choose "Hobby" (free) or "Basic" ($100/mo)',
      'STEP 3: Create a new Project and App in the Developer Portal',
      'STEP 4: In your App settings, go to "Keys and Tokens"',
      'STEP 5: Generate API Key and Secret (Consumer Keys)',
      'STEP 6: Under "User Authentication Settings", enable OAuth 1.0a',
      'STEP 7: Generate Access Token and Access Token Secret for your account',
      'STEP 8: Set callback URL to your app URL and permissions to "Read and Write"',
      'Free Hobby tier: 1,500 tweets/month. Basic: 10,000 tweets/month'
    ]
  },
  linkedin: {
    label: 'LinkedIn API',
    url: 'https://www.linkedin.com/developers/apps',
    category: 'social',
    fields: [
      { name: 'Client ID', placeholder: 'e.g., 86a...', key_name: 'Client ID' },
      { name: 'Client Secret', placeholder: 'e.g., Rb0...', key_name: 'Client Secret' },
    ],
    instructions: [
      'STEP 1: Go to https://www.linkedin.com/developers/ and sign in',
      'STEP 2: Click "Create App" — fill in app name, company, and privacy policy URL',
      'STEP 3: Your Client ID is shown immediately after creation',
      'STEP 4: Go to "Auth" tab → copy Client Secret',
      'STEP 5: Add "w_organization_social" and "r_organization_social" products',
      'STEP 6: Set authorized redirect URL to your app callback URL',
      'STEP 7: Request access to "Share on LinkedIn" and "Organization API" products',
      'Note: LinkedIn API approval can take 3-7 business days',
      'Free tier available for company page management and posting'
    ]
  },
  sendgrid: {
    label: 'SendGrid (Email)',
    url: 'https://app.sendgrid.com/settings/api_keys',
    category: 'communication',
    fields: [
      { name: 'API Key', placeholder: 'SG....', key_name: 'API Key' }
    ],
    instructions: [
      'STEP 1: Go to https://signup.sendgrid.com/ and create a free account',
      'STEP 2: Verify your email address and complete the setup wizard',
      'STEP 3: Go to Settings → API Keys in the left sidebar',
      'STEP 4: Click "Create API Key" → give it a name (e.g., "Roshanal")',
      'STEP 5: Select "Full Access" or "Restricted Access" (recommended)',
      'STEP 6: Copy the key immediately — it starts with "SG."',
      'STEP 7: Verify your sender domain (Settings → Sender Authentication)',
      'Free tier: 100 emails/day forever. Sufficient for campaigns'
    ]
  },
  twilio: {
    label: 'Twilio (SMS & Voice)',
    url: 'https://www.twilio.com/console',
    category: 'communication',
    fields: [
      { name: 'Account SID', placeholder: 'AC...', key_name: 'Account SID' },
      { name: 'Auth Token', placeholder: 'e.g., 1234567890abcdef...', key_name: 'Auth Token' },
      { name: 'Phone Number', placeholder: '+1...', key_name: 'Phone Number' }
    ],
    instructions: [
      'STEP 1: Go to https://www.twilio.com/try-twilio and create an account',
      'STEP 2: Verify your personal phone number (required for trial)',
      'STEP 3: Your Account SID is on the Console dashboard (starts with "AC")',
      'STEP 4: Click "Show" next to Auth Token and copy it',
      'STEP 5: Go to Phone Numbers → Buy a Number → search for SMS-capable number',
      'STEP 6: Select a number and add it to your account',
      'STEP 7: For production, upgrade from trial to paid account',
      'Trial account: $15 credit. SMS costs ~$0.0079/message to Nigerian numbers'
    ]
  },
  elevenlabs: {
    label: 'ElevenLabs (Voice AI)',
    url: 'https://elevenlabs.io/app/sign-up',
    category: 'ai',
    fields: [
      { name: 'API Key', placeholder: 'e.g., eleven_labs_key...', key_name: 'API Key' }
    ],
    instructions: [
      'STEP 1: Go to https://elevenlabs.io/ and create an account',
      'STEP 2: Click your profile icon → "Profile" → "API Key"',
      'STEP 3: Copy the API key shown on the page',
      'STEP 4: Used for AI voice agents and call automation',
      'Free tier: 10,000 characters/month (~10 minutes of audio)',
      'Starter plan: $5/month for 30,000 characters'
    ]
  },
  vercel_blob: {
    label: 'Vercel Blob Storage',
    url: 'https://vercel.com/docs/storage/vercel-blob',
    category: 'storage',
    fields: [
      { name: 'Blob Read/Write Token', placeholder: 'vercel_blob_rw_...', key_name: 'BLOB_READ_WRITE_TOKEN' }
    ],
    instructions: [
      'STEP 1: Go to your Vercel dashboard at https://vercel.com/dashboard',
      'STEP 2: Select your project → go to "Storage" tab',
      'STEP 3: Click "Create Database" → select "Blob"',
      'STEP 4: After creation, go to the Blob store → "Tokens" tab',
      'STEP 5: Click "Create Token" → give it a name',
      'STEP 6: Copy the token (starts with "vercel_blob_rw_")',
      'STEP 7: Also set this token in your Vercel Environment Variables',
      'Free tier: 1GB storage, 50GB bandwidth/month'
    ]
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI & Machine Learning',
  social: 'Social Media',
  communication: 'Email & SMS',
  data: 'Data & Scraping',
  storage: 'Storage & Files'
}

export default function AdminApiKeyNewPage() {
  const [selectedService, setSelectedService] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [totalFields, setTotalFields] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null

  if (userRole !== 'admin') {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <a href="/admin/api-keys" className="text-gray-500 hover:text-gray-700">
            ← Back
          </a>
          <h1 className="text-3xl font-clash font-bold text-gray-900">Add New API Key</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Admin Access Required</h2>
          <p className="text-red-700 mb-4">
            Only administrators can add and manage API keys.
          </p>
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700 max-w-md mx-auto">
            <p className="font-medium mb-2">Current login:</p>
            <p><span className="text-gray-500">Name:</span> {userName || 'Unknown'}</p>
            <p><span className="text-gray-500">Role:</span> <span className="text-red-600 font-medium">{userRole || 'Not logged in'}</span></p>
          </div>
          <p className="text-red-600 text-sm mt-4">
            Contact the system administrator to upgrade your account, or log in with an admin account.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <a href="/admin/api-keys" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Back to Keys
            </a>
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Switch Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  const config = selectedService ? SERVICE_CONFIG[selectedService] : null

  function handleFieldChange(keyName: string, value: string) {
    setFieldValues(prev => ({ ...prev, [keyName]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !config) return

    const requiredFields = config.fields.filter(f => f.required !== false)
    const missingFields = requiredFields.filter(f => !fieldValues[f.key_name])
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)
    setSavedCount(0)

    const fieldsToSave = config.fields.filter(f => f.required !== false)
    setTotalFields(fieldsToSave.length)

    try {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setError('Authentication token not found. Please log in again.')
        setIsSubmitting(false)
        return
      }

      if (selectedService === 'pollinations') {
        const res = await fetch('/api/admin/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            service: 'pollinations',
            key_name: 'status',
            value: 'no_key_required_free_service'
          }),
        })
        const data = await res.json()
        if (data.error) {
          setError(`Error: ${data.error}`)
          setIsSubmitting(false)
          return
        }
        setSavedCount(1)
        setSuccess(true)
        setTimeout(() => { window.location.href = '/admin/api-keys' }, 1500)
        return
      }

      for (const field of fieldsToSave) {
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
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/api-keys" className="text-gray-500 hover:text-gray-700">
          ← Back
        </a>
        <div>
          <h1 className="text-3xl font-clash font-bold text-gray-900">Add New API Key</h1>
          <p className="text-sm text-gray-500 mt-1">All keys are encrypted with AES-256-GCM before storage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
              <optgroup key={catKey} label={catLabel}>
                {Object.entries(SERVICE_CONFIG)
                  .filter(([_, cfg]) => cfg.category === catKey)
                  .map(([value, cfg]) => (
                    <option key={value} value={value}>{cfg.label}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {config && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md overflow-hidden">
            <a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 text-white hover:text-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-base">Get {config.label} API Key</p>
                  <p className="text-sm text-blue-100">Click to open the developer portal →</p>
                </div>
              </div>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}

        {config && config.instructions && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-900">How to Get Your API Key</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{config.instructions.length} steps</span>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${showInstructions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showInstructions && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <ol className="space-y-3 pt-4">
                  {config.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ All {savedCount} API key(s) saved successfully! Redirecting...
          </div>
        )}

        {isSubmitting && savedCount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            Saving {savedCount}/{totalFields} keys...
          </div>
        )}

        {config && config.fields.some(f => f.required !== false) && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Credentials</h3>
            {config.fields.filter(f => f.required !== false).map((field) => (
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
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? `Saving... (${savedCount}/${totalFields})` : 'Save Encrypted Keys'}
        </button>
      </form>
    </div>
  )
}

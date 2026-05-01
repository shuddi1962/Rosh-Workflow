export default function AdminApiKeyNewPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-6">Add New API Key</h1>
      <form action="/api/admin/api-keys" method="POST" className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Service</label>
           <select name="service" required className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
             <option value="anthropic">Anthropic (Claude)</option>
             <option value="openai">OpenAI</option>
             <option value="openrouter">OpenRouter (Multi-Model)</option>
             <option value="kie_ai">Kie.ai (Video/Image Gen)</option>
             <option value="apify">Apify</option>
             <option value="news_api">News API</option>
             <option value="google_trends">Google Trends</option>
             <option value="meta">Meta (Facebook/Instagram/WhatsApp)</option>
             <option value="twitter">Twitter/X</option>
             <option value="linkedin">LinkedIn</option>
             <option value="sendgrid">SendGrid</option>
             <option value="twilio">Twilio</option>
             <option value="google_maps">Google Maps</option>
           </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Key Name</label>
          <input type="text" name="key_name" placeholder="e.g., Production Key" required className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">API Key Value</label>
          <input type="password" name="value" required placeholder="Enter API key (will be encrypted)" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Encrypted Key</button>
      </form>
    </div>
  )
}

export default function AdminApiKeyNewPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-6">Add New API Key</h1>
      <form action="/api/admin/api-keys" method="POST" className="space-y-6 bg-bg-surface p-6 rounded-lg border border-border-subtle">
        <div>
          <label className="block text-text-secondary mb-2">Service</label>
          <select name="service" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary">
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI</option>
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
          <label className="block text-text-secondary mb-2">Key Name</label>
          <input type="text" name="key_name" placeholder="e.g., Production Key" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">API Key Value</label>
          <input type="password" name="value" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
        </div>
        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium">Save Encrypted Key</button>
      </form>
    </div>
  )
}

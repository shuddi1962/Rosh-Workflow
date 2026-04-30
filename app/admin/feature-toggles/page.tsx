export default function FeatureTogglesPage() {
  const toggles = [
    { key: 'auto_trend_discovery', label: 'Auto Trend Discovery', enabled: true },
    { key: 'auto_competitor_monitoring', label: 'Auto Competitor Monitoring', enabled: false },
    { key: 'ai_content_generation', label: 'AI Content Generation', enabled: true },
    { key: 'whatsapp_campaigns', label: 'WhatsApp Campaigns', enabled: false },
    { key: 'instagram_auto_post', label: 'Instagram Auto Post', enabled: true },
  ]
  
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">🎛️ Platform Settings</h1>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">Feature Toggles</h3>
        <div className="space-y-4">
          {toggles.map((toggle, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-bg-elevated rounded-lg">
              <div>
                <p className="text-text-primary font-medium">{toggle.label}</p>
                <p className="text-text-muted text-sm">{toggle.key}</p>
              </div>
              <button className={`w-12 h-6 rounded-full transition ${toggle.enabled ? 'bg-accent-primary' : 'bg-bg-overlay'}`}>
                <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${toggle.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminSocialAccountsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">📱 Social Accounts</h1>
        <button className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Connect Account</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { platform: 'Facebook', connected: false },
          { platform: 'Instagram', connected: false },
          { platform: 'WhatsApp Business', connected: false },
          { platform: 'LinkedIn', connected: false },
          { platform: 'Twitter/X', connected: false },
          { platform: 'TikTok', connected: false }
        ].map((acc, i) => (
          <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-clash font-semibold text-text-primary">{acc.platform}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${acc.connected ? 'bg-status-live/20 text-status-live' : 'bg-status-draft/20 text-status-draft'}`}>
                {acc.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <button className="px-4 py-2 bg-bg-elevated text-text-secondary rounded-lg text-sm w-full">
              {acc.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

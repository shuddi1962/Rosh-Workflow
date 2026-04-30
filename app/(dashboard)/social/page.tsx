import Link from 'next/link'

export default function SocialPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">📱 Social Media Automation</h1>
        <Link href="/dashboard/social/accounts" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">Connect Accounts</Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { platform: 'Instagram', connected: true, count: 12 },
          { platform: 'Facebook', connected: true, count: 8 },
          { platform: 'WhatsApp', connected: false, count: 0 }
        ].map((acc, i) => (
          <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-clash font-semibold text-text-primary">{acc.platform}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${acc.connected ? 'bg-status-live/20 text-status-live' : 'bg-status-draft/20 text-status-draft'}`}>
                {acc.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-text-muted text-sm">{acc.count} posts scheduled</p>
          </div>
        ))}
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">📅 Calendar View</h3>
        <p className="text-text-muted">Scheduled posts calendar coming soon...</p>
      </div>
    </div>
  )
}

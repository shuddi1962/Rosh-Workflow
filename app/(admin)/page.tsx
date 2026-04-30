import Link from 'next/link'

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">🔴 Admin Panel — Roshanal Infotech</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: '1', icon: '👥' },
          { label: "Today's Posts", value: '0', icon: '📱' },
          { label: 'Leads This Month', value: '0', icon: '👔' },
          { label: 'AI Cost Today', value: '$0.00', icon: '🤖' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6">
            <p className="text-text-muted text-sm mb-1">{stat.icon} {stat.label}</p>
            <p className="text-3xl font-jetbrains text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Recent Activity</h3>
          <p className="text-text-muted">No activity yet.</p>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">System Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Insforge DB</span>
              <span className="text-status-live">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">AI API</span>
              <span className="text-status-draft">○ Not Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

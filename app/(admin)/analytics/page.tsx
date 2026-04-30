export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">📊 Full Platform Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: '₦0', change: '+0%' },
          { label: 'Leads This Month', value: '0', change: '+0%' },
          { label: 'Posts Published', value: '0', change: '+0%' },
          { label: 'AI Cost (Month)', value: '$0.00', change: '+0%' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6">
            <p className="text-text-muted text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-jetbrains text-text-primary">{stat.value}</p>
            <p className="text-status-live text-xs mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">AI Costs Breakdown</h3>
          <p className="text-text-muted text-sm">No data yet.</p>
        </div>
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Platform Performance</h3>
          <p className="text-text-muted text-sm">No data yet.</p>
        </div>
      </div>
    </div>
  )
}

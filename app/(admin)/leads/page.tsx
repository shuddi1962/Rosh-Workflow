import Link from 'next/link'

export default function AdminLeadsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">👔 Lead Management</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">🕵️ Scrape Leads</button>
          <button className="px-4 py-2 border border-border-default text-text-secondary rounded-lg">Import CSV</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Leads', value: '0', color: 'text-text-primary' },
          { label: 'Hot Leads', value: '0', color: 'text-status-live' },
          { label: 'Warm Leads', value: '0', color: 'text-status-scheduled' },
          { label: 'New This Month', value: '0', color: 'text-accent-gold' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6">
            <p className="text-text-muted text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-jetbrains ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">Recent Leads</h3>
        <p className="text-text-muted">No leads yet. Use "Scrape Leads" to find potential customers.</p>
      </div>
    </div>
  )
}

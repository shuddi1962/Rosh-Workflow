import Link from 'next/link'

export default function AdminCampaignsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">📧 Campaign Oversight</h1>
        <Link href="/admin/campaigns/new" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ New Campaign</Link>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <p className="text-text-muted">No campaigns yet.</p>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function CampaignsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">📧 Campaigns</h1>
        <Link href="/dashboard/campaigns/new" className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg">
          + New Campaign
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">WhatsApp Campaign</h3>
          <p className="text-text-muted text-sm mb-4">Send bulk WhatsApp messages to leads</p>
          <span className="px-2 py-1 bg-status-live/20 text-status-live rounded-full text-xs">Active</span>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">Email Campaign</h3>
          <p className="text-text-muted text-sm mb-4">SendGrid email blasts</p>
          <span className="px-2 py-1 bg-status-draft/20 text-status-draft rounded-full text-xs">Draft</span>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">SMS Campaign</h3>
          <p className="text-text-muted text-sm mb-4">Twilio SMS broadcasts</p>
          <span className="px-2 py-1 bg-status-scheduled/20 text-status-scheduled rounded-full text-xs">Scheduled</span>
        </div>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">Recent Campaigns</h3>
        <p className="text-text-muted">No campaigns yet. Create your first campaign to get started.</p>
      </div>
    </div>
  )
}

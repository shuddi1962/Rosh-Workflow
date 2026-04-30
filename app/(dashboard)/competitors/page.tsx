import Link from 'next/link'

export default function CompetitorsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">🕵️ Competitor Spy Intel</h1>
        <button className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Add Competitor</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Marine Competitors</h3>
          <div className="space-y-3">
            <div className="p-3 bg-bg-elevated rounded border-l-4 border-status-live">
              <p className="text-text-primary text-sm font-medium">Marine Equipment PH</p>
              <p className="text-text-muted text-xs">Last scan: 2 hours ago</p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Tech Competitors</h3>
          <div className="space-y-3">
            <div className="p-3 bg-bg-elevated rounded border-l-4 border-accent-purple">
              <p className="text-text-primary text-sm font-medium">Security Systems Nigeria</p>
              <p className="text-text-muted text-xs">Last scan: 5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">🔍 What We're Not Doing (Gap Analysis)</h3>
        <div className="space-y-4">
          <div className="p-4 bg-bg-elevated rounded border-l-4 border-accent-gold">
            <p className="text-text-primary text-sm font-medium">Competitor runs video testimonials — we don't</p>
            <p className="text-text-muted text-xs mt-1">Priority: Critical — they get 3x more engagement</p>
          </div>
          <div className="p-4 bg-bg-elevated rounded border-l-4 border-accent-orange">
            <p className="text-text-primary text-sm font-medium">They post at 7PM daily — our posting is irregular</p>
            <p className="text-text-muted text-xs mt-1">Priority: High — Nigerians are most active evenings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

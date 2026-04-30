'use client'

import Link from 'next/link'

export default function TrendsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">Live Trend Monitor</h1>
        <button 
          onClick={async () => {
            await fetch('/api/trends', { method: 'POST' })
            window.location.reload()
          }}
          className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg"
        >
          🔄 Refresh Trends
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">🌊 Marine Trends</h3>
          <div className="space-y-3">
            {['outboard engine Nigeria', 'fiberglass boat Port Harcourt', 'marine equipment Rivers State'].map((trend, i) => (
              <div key={i} className="p-3 bg-bg-elevated rounded border-l-4 border-accent-blue">
                <p className="text-text-primary text-sm font-medium">{trend}</p>
                <p className="text-text-muted text-xs">Score: {95 - i * 5} • Marine</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">💻 Tech Trends</h3>
          <div className="space-y-3">
            {['CCTV installation Port Harcourt', 'solar inverter price Nigeria', 'PHCN outage Port Harcourt'].map((trend, i) => (
              <div key={i} className="p-3 bg-bg-elevated rounded border-l-4 border-accent-purple">
                <p className="text-text-primary text-sm font-medium">{trend}</p>
                <p className="text-text-muted text-xs">Score: {92 - i * 5} • Tech</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">All Trends</h3>
        <p className="text-text-muted">Click "Refresh Trends" to fetch latest trends from Google Trends and News API.</p>
      </div>
    </div>
  )
}

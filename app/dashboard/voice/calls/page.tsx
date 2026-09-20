'use client'

export default function VoiceCallsPage() {
  return (
    <div>
      <h1 className="font-clash text-3xl font-bold text-text-primary mb-6">Call History</h1>
      <p className="text-text-secondary mb-6">All inbound and outbound calls.</p>
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
        <p className="text-text-secondary text-lg mb-2">No calls yet</p>
        <p className="text-text-muted text-sm">Call logs will appear here when voice agents make or receive calls.</p>
      </div>
    </div>
  )
}

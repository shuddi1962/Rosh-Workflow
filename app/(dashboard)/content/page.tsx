import Link from 'next/link'

export default function ContentBrainPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">Content Brain Box</h1>
        <button className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium">✦ Generate Content</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">Marine Division</h3>
          <p className="text-text-muted text-sm mb-4">Outboard Engines, Fiberglass Boats, Marine Safety</p>
          <div className="space-y-2">
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">📦 Product Spotlight</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">🆕 New Arrival</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">📚 Educational</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">📈 Trend Reactive</button>
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">Tech Division</h3>
          <p className="text-text-muted text-sm mb-4">CCTV, Solar, Smart Locks, Car Trackers</p>
          <div className="space-y-2">
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">🛡️ Security Awareness</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">⚡ Power Crisis Content</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">📹 Product Demo</button>
            <button className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-primary border border-transparent transition">📊 Case Study</button>
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-2">Live Trends</h3>
          <p className="text-text-muted text-sm mb-4">AI-matched trending topics</p>
          <div className="space-y-3">
            <div className="p-3 bg-bg-elevated rounded border-l-4 border-status-live">
              <p className="text-text-primary text-sm font-medium">CCTV Installation Port Harcourt</p>
              <p className="text-text-muted text-xs">Score: 92 • Tech</p>
            </div>
            <div className="p-3 bg-bg-elevated rounded border-l-4 border-status-scheduled">
              <p className="text-text-primary text-sm font-medium">Outboard Engine Price Nigeria</p>
              <p className="text-text-muted text-xs">Score: 87 • Marine</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">Generated Content</h3>
        <div className="space-y-4">
          <div className="p-4 bg-bg-elevated rounded-lg border border-border-subtle">
            <div className="flex justify-between items-start mb-2">
              <span className="text-accent-purple text-xs font-medium">✦ AI Generated • Marine • Product Spotlight</span>
              <span className="text-text-muted text-xs">Draft</span>
            </div>
            <p className="text-text-primary text-sm mb-3">Just Arrived: Suzuki 100HP 4-Stroke Outboard Engine! Perfect for Niger Delta operations. Genuine warranty, available now in Port Harcourt. Call 08109522432...</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-accent-primary text-text-on-accent rounded text-xs">Schedule</button>
              <button className="px-3 py-1 border border-border-default text-text-secondary rounded text-xs">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

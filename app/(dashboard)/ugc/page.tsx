export default function UGCPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">🎬 UGC Ad Creator</h1>
        <button className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-primary text-text-on-accent rounded-lg font-medium">✦ Generate UGC Ad</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Ad Types</h3>
          <div className="space-y-2">
            {['Testimonial Script', 'Unboxing Script', 'Problem-Solution', 'WhatsApp Broadcast', 'Google Search Ad'].map((type, i) => (
              <button key={i} className="w-full text-left py-2 px-3 rounded bg-bg-elevated text-text-secondary hover:border-accent-purple border border-transparent transition">
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Generated Ads</h3>
          <div className="space-y-3">
            <div className="p-4 bg-bg-elevated rounded border border-border-subtle">
              <p className="text-text-primary text-sm font-medium mb-2">Problem-Solution Video Script</p>
              <p className="text-text-muted text-xs mb-2">Marine • Suzuki Engine</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded text-xs">View Script</button>
                <button className="px-3 py-1 border border-border-default text-text-secondary rounded text-xs">Use in Campaign</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

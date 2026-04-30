export default function AdminCompetitorsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">🕵️ Competitor Monitor</h1>
        <button className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Add Competitor</button>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <p className="text-text-muted">No competitors added yet. Add competitors to start monitoring.</p>
      </div>
    </div>
  )
}

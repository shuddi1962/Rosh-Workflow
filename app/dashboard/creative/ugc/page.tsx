export default function CreativeUgcPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-6">UGC Ad Builder</h1>
      
      <div className="bg-white rounded-lg border border-border-subtle shadow-sm p-8 text-center">
        <div className="text-text-muted/50 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Coming Soon</h3>
        <p className="text-text-secondary">Build user-generated content style ads for authentic marketing.</p>
      </div>
    </div>
  )
}

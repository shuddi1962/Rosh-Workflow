export default function AdminAuditLogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">📋 Audit Logs</h1>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <div className="space-y-3">
          {[
            { action: 'User login', user: 'admin@roshanal.com', time: '2 hours ago' },
            { action: 'API key added', user: 'admin@roshanal.com', time: '1 day ago' }
          ].map((log, i) => (
            <div key={i} className="p-3 bg-bg-elevated rounded border border-border-subtle flex justify-between">
              <div>
                <p className="text-text-primary text-sm font-medium">{log.action}</p>
                <p className="text-text-muted text-xs">{log.user}</p>
              </div>
              <span className="text-text-muted text-xs">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

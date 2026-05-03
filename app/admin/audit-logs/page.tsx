'use client'

import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  ip_address: string
  user_agent: string
  created_at: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      if (filterAction) params.set('action', filterAction)
      if (filterEntity) params.set('entityType', filterEntity)
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-text-secondary">Loading audit logs...</div>

  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">Audit Logs</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          placeholder="Filter by action..."
          className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-primary"
        />
        <input
          type="text"
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          placeholder="Filter by entity..."
          className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-primary"
        />
        <button onClick={fetchLogs} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90">Apply</button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-surface">
            <tr>
              <th className="text-left p-4 text-text-secondary text-sm">Timestamp</th>
              <th className="text-left p-4 text-text-secondary text-sm">User</th>
              <th className="text-left p-4 text-text-secondary text-sm">Action</th>
              <th className="text-left p-4 text-text-secondary text-sm">Entity</th>
              <th className="text-left p-4 text-text-secondary text-sm">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border-subtle hover:bg-bg-surface">
                <td className="p-4 text-text-secondary text-sm">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-4 text-text-primary text-sm">{log.user_id}</td>
                <td className="p-4 text-text-primary text-sm font-medium">{log.action}</td>
                <td className="p-4 text-text-secondary text-sm">{log.entity_type}</td>
                <td className="p-4 text-text-muted text-sm font-mono">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="p-8 text-text-muted text-center">No audit logs found</p>
        )}
      </div>
    </div>
  )
}

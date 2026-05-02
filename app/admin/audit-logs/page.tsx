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

  if (loading) return <div className="p-6 text-gray-600">Loading audit logs...</div>

  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-8">Audit Logs</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          placeholder="Filter by action..."
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
        <input
          type="text"
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          placeholder="Filter by entity..."
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
        />
        <button onClick={fetchLogs} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Apply</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 text-sm">Timestamp</th>
              <th className="text-left p-4 text-gray-600 text-sm">User</th>
              <th className="text-left p-4 text-gray-600 text-sm">Action</th>
              <th className="text-left p-4 text-gray-600 text-sm">Entity</th>
              <th className="text-left p-4 text-gray-600 text-sm">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-gray-600 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-4 text-gray-900 text-sm">{log.user_id}</td>
                <td className="p-4 text-gray-900 text-sm font-medium">{log.action}</td>
                <td className="p-4 text-gray-600 text-sm">{log.entity_type}</td>
                <td className="p-4 text-gray-500 text-sm font-mono">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="p-8 text-gray-500 text-center">No audit logs found</p>
        )}
      </div>
    </div>
  )
}

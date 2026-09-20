"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface AuditLogTableProps {
  limit?: number
}

export function AuditLogTable({ limit = 50 }: AuditLogTableProps) {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data.logs || [])
      setLoading(false)
    }
    fetchLogs()
  }, [limit])

  if (loading) return <div className="text-text-muted text-sm">Loading audit logs...</div>

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex items-center gap-2">
        <FileText className="w-5 h-5 text-accent-primary-glow" />
        <h3 className="font-clash text-lg font-semibold text-text-primary">Audit Logs</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id as string}>
              <TableCell className="text-text-muted text-sm">
                {new Date(log.created_at as string).toLocaleString()}
              </TableCell>
              <TableCell className="text-text-primary text-sm">{log.user_id as string}</TableCell>
              <TableCell>
                <Badge status={(log.action as string)?.includes("delete") ? "failed" : "scheduled"}>
                  {log.action as string}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary text-sm capitalize">
                {log.entity_type as string}
              </TableCell>
              <TableCell className="text-text-muted text-xs max-w-[200px] truncate">
                {JSON.stringify(log.details)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {logs.length === 0 && (
        <div className="text-center py-8 text-text-muted text-sm">No audit logs found</div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { KPICard } from "@/components/dashboard/kpi-card"
import AddLeadModal from "@/components/leads/add-lead-modal"
import { Users, Search, Phone, Mail, Filter, Trash2, Edit, Download, Upload, Plus } from "lucide-react"

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  location: string
  division_interest: string
  source: string
  status: string
  score: number
  tier: string
  notes: string
  created_at: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [importing, setImporting] = useState(false)
  const [notice, setNotice] = useState('')

  const fetchLeads = async () => {
    const token = localStorage.getItem("accessToken")
    const res = await fetch("/api/leads", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setLeads(data.leads || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filtered = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
      lead.phone.includes(search)
    const matchStatus = filterStatus === "all" || lead.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: leads.length,
    customers: leads.filter((l) => l.status === "customer").length,
    hot: leads.filter((l) => l.tier === "hot").length,
    new: leads.filter((l) => l.status === "new").length,
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (error) {
      console.error("Error deleting lead:", error)
    }
  }

  const handleExport = () => {
    const headers = ["Name", "Phone", "Email", "Company", "Location", "Division", "Source", "Status", "Tier", "Score", "Notes", "Created"]
    const rows = filtered.map(l => [
      l.name, l.phone, l.email || "", l.company || "", l.location,
      l.division_interest, l.source, l.status, l.tier, l.score,
      l.notes, l.created_at
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `roshanal-leads-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    setImporting(true)
    setNotice('')
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length < 2) throw new Error('CSV is empty — expected a header row plus data rows.')
      const splitRow = (row: string): string[] => {
        const out: string[] = []
        let cur = ''
        let inQuotes = false
        for (let i = 0; i < row.length; i++) {
          const ch = row[i]
          if (ch === '"') {
            if (inQuotes && row[i + 1] === '"') { cur += '"'; i++ }
            else inQuotes = !inQuotes
          } else if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = '' }
          else cur += ch
        }
        out.push(cur.trim())
        return out
      }
      const headers = splitRow(lines[0]).map((h) => h.toLowerCase())
      const idx = (names: string[]): number => {
        for (const n of names) { const i = headers.indexOf(n); if (i >= 0) return i }
        return -1
      }
      const iName = idx(['name', 'full_name', 'full name'])
      const iPhone = idx(['phone', 'phone_number', 'mobile'])
      if (iName < 0 || iPhone < 0) throw new Error('CSV needs at least "name" and "phone" columns.')
      const iEmail = idx(['email'])
      const iCompany = idx(['company', 'organisation', 'organization'])
      const iLocation = idx(['location', 'city', 'address'])
      const iNotes = idx(['notes', 'note', 'remarks'])
      const leads = lines.slice(1).map(splitRow).filter((c) => c[iPhone] || c[iName]).map((c) => ({
        name: c[iName] || 'Unknown',
        phone: c[iPhone] || '',
        email: iEmail >= 0 ? c[iEmail] : '',
        company: iCompany >= 0 ? c[iCompany] : '',
        location: iLocation >= 0 && c[iLocation] ? c[iLocation] : 'Port Harcourt',
        notes: iNotes >= 0 ? c[iNotes] : '',
        source: 'csv_import',
      }))
      if (leads.length === 0) throw new Error('No valid rows found (each row needs a name and phone).')
      const token = localStorage.getItem("accessToken")
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setNotice(data.message || `${leads.length} leads imported`)
      await fetchLeads()
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <div className="text-text-muted text-sm">Loading leads...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-bold text-text-primary mb-1">Lead Management</h1>
          <p className="text-text-muted text-sm">Admin view — manage all leads across the organization</p>
        </div>
        <div className="flex gap-2">
          <label className={`inline-flex items-center px-4 py-2 border border-border-subtle rounded-lg text-sm font-medium cursor-pointer hover:bg-bg-surface ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importing...' : 'Import CSV'}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImportFile(f)
                e.target.value = ''
              }}
            />
          </label>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddLead(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {notice && (
        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3 text-sm text-text-primary">
          {notice}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Leads" value={stats.total} icon={Users} color="blue" />
        <KPICard title="Customers" value={stats.customers} icon={Users} color="emerald" />
        <KPICard title="Hot Leads" value={stats.hot} icon={Filter} color="orange" />
        <KPICard title="New Leads" value={stats.new} icon={Users} color="gold" />
      </div>

      <div className="bg-bg-surface rounded-lg border border-border-subtle p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-sm text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="customer">Customer</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium text-text-primary">{lead.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary text-sm">{lead.company || "—"}</TableCell>
                <TableCell>
                  <Badge status="scheduled">{lead.source}</Badge>
                </TableCell>
                <TableCell><StatusBadge status={lead.status} size="sm" /></TableCell>
                <TableCell><StatusBadge status={lead.tier} size="sm" /></TableCell>
                <TableCell><span className="font-mono text-sm text-text-primary">{lead.score}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingLead(lead)}>
                      <Edit className="w-4 h-4 text-text-muted" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}>
                      <Trash2 className="w-4 h-4 text-accent-red" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">No leads found</div>
        )}
      </div>

      <AnimatePresence>
        {showAddLead && (
          <AddLeadModal
            open={showAddLead}
            onClose={() => setShowAddLead(false)}
            onSuccess={async () => {
              const token = localStorage.getItem("accessToken")
              const res = await fetch("/api/leads", {
                headers: { Authorization: `Bearer ${token}` },
              })
              const data = await res.json()
              setLeads(data.leads || [])
            }}
          />
        )}
        {editingLead && (
          <AddLeadModal
            open={!!editingLead}
            onClose={() => setEditingLead(null)}
            lead={editingLead}
            onSuccess={async () => {
              const token = localStorage.getItem("accessToken")
              const res = await fetch("/api/leads", {
                headers: { Authorization: `Bearer ${token}` },
              })
              const data = await res.json()
              setLeads(data.leads || [])
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

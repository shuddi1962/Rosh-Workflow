"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Users, Search, Phone, Mail, Filter, Trash2, Edit, Download, Upload } from "lucide-react"

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

  useEffect(() => {
    const fetchLeads = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLeads(data.leads || [])
      setLoading(false)
    }
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

  if (loading) return <div className="text-text-muted text-sm">Loading leads...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-bold text-text-primary mb-1">Lead Management</h1>
          <p className="text-text-muted text-sm">Admin view — manage all leads across the organization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
                    <Button variant="ghost" size="icon">
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
    </div>
  )
}

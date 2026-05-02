'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Users, Plus, Search, Phone, Mail, Filter, UserPlus, Loader2, Save, X, MessageSquare, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  location: string
  division_interest: string
  product_interest: string[]
  source: string
  status: string
  score: number
  tier: string
  notes: string
  last_contact: string
  next_action: string
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      fetchLeads()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleSaveNotes = async () => {
    if (!editingLead) return
    try {
      setSaving(true)
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: editingLead.notes,
          next_action: editingLead.next_action,
          tier: editingLead.tier,
        })
      })
      setEditingLead(null)
      fetchLeads()
    } catch (err) {
      console.error('Error saving notes:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
      lead.phone.includes(search)
    const matchTier = filterTier === "all" || lead.tier === filterTier
    const matchStatus = filterStatus === "all" || lead.status === filterStatus
    return matchSearch && matchTier && matchStatus
  })

  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.tier === "hot").length,
    warm: leads.filter((l) => l.tier === "warm").length,
    new: leads.filter((l) => l.status === "new").length,
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-clash text-2xl font-bold text-gray-900 mb-1">Lead Management</h1>
        <p className="text-gray-600 text-sm">Manage and track all your business leads</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Leads" value={stats.total} icon={Users} color="blue" />
        <KPICard title="Hot Leads" value={stats.hot} icon={UserPlus} color="orange" />
        <KPICard title="Warm Leads" value={stats.warm} icon={Users} color="gold" />
        <KPICard title="New Leads" value={stats.new} icon={Plus} color="emerald" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search leads by name, company, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="quote_sent">Quote Sent</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={fetchLeads}
              variant="outline"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filtered.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">{lead.company || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={lead.division_interest === "marine" ? "default" : "info"}
                      className={lead.division_interest === "marine" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}
                    >
                      {lead.division_interest}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.tier} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="quote_sent">Quote Sent</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-900">{lead.score}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingLead(lead)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Notes
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No leads found matching your criteria</div>
        )}
      </motion.div>

      {editingLead && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingLead(null)}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-clash text-lg font-semibold text-gray-900">
                {editingLead.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingLead(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tier</Label>
                <Select
                  value={editingLead.tier}
                  onValueChange={(value) => setEditingLead({ ...editingLead, tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  rows={4}
                  placeholder="Add notes about this lead..."
                />
              </div>

              <div>
                <Label>Next Action</Label>
                <Input
                  value={editingLead.next_action || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, next_action: e.target.value })}
                  placeholder="e.g., Call on Monday at 10am"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingLead(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

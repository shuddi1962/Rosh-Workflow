"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"

interface LeadSelectorProps {
  selected: string[]
  onChange: (leads: string[]) => void
  division?: string
}

export function LeadSelector({ selected, onChange, division }: LeadSelectorProps) {
  const [leads, setLeads] = useState<Array<Record<string, unknown>>>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      const token = localStorage.getItem("accessToken")
      const url = division ? `/api/leads?division=${division}` : "/api/leads"
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setLeads(data.leads || [])
      setLoading(false)
    }
    fetchLeads()
  }, [division])

  const filtered = leads.filter((lead) => {
    const name = (lead.name as string)?.toLowerCase() || ""
    const company = (lead.company as string)?.toLowerCase() || ""
    const query = search.toLowerCase()
    return name.includes(query) || company.includes(query)
  })

  const toggleLead = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((l) => l !== id) : [...selected, id])
  }

  const selectAll = () => onChange(filtered.map((l) => l.id as string))
  const deselectAll = () => onChange([])

  if (loading) return <div className="text-text-muted text-sm">Loading leads...</div>

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-primary-glow" />
          Select Leads ({selected.length})
        </h3>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs text-accent-primary-glow hover:underline">Select All</button>
          <button onClick={deselectAll} className="text-xs text-text-muted hover:underline">Deselect All</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((lead) => {
          const isSelected = selected.includes(lead.id as string)
          return (
            <button
              key={lead.id as string}
              onClick={() => toggleLead(lead.id as string)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? "border-accent-primary bg-accent-primary/10"
                  : "border-border-subtle bg-bg-base hover:border-border-hover"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{lead.name as string}</p>
                  <p className="text-xs text-text-muted">{lead.company as string || "No company"} - {lead.location as string}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={lead.tier as string}>{lead.tier as string}</Badge>
                  <Badge status={lead.status as string}>{lead.status as string}</Badge>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

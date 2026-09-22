'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Users, UserPlus, Flame, ThermometerSun, Snowflake, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface Lead {
  id: string
  full_name: string
  phone: string
  email?: string | null
  company?: string | null
  division_interest: string
  score: number
  tier: string
  stage: string
  qualification_status: string
  created_at?: string
}

const TIER_FILTERS = [
  { id: 'all', label: 'All tiers' },
  { id: 'hot', label: 'Hot' },
  { id: 'warm', label: 'Warm' },
  { id: 'cold', label: 'Cold' },
] as const

function TierBadge({ tier }: { tier: string }) {
  const t = tier?.toLowerCase() || 'cold'
  if (t === 'hot') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-red/10 text-accent-red">
        <Flame className="w-3 h-3" /> Hot
      </span>
    )
  }
  if (t === 'warm') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-gold/15 text-accent-gold">
        <ThermometerSun className="w-3 h-3" /> Warm
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary">
      <Snowflake className="w-3 h-3" /> Cold
    </span>
  )
}

function StagePill({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-surface border border-border-subtle text-text-secondary capitalize">
      {stage?.replace(/_/g, ' ') || 'New'}
    </span>
  )
}

export default function CRMLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch('/api/crm/leads?limit=200', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setLeads(data.leads || [])
        }
      } catch {
        console.error('Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((l) => {
      const matchesSearch =
        !q ||
        l.full_name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.email?.toLowerCase().includes(q)
      const matchesTier = tierFilter === 'all' || l.tier?.toLowerCase() === tierFilter
      return matchesSearch && matchesTier
    })
  }, [leads, search, tierFilter])

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title="All Leads"
        description="Every lead in your CRM — search, filter and open any record."
        actions={
          <>
            <button
              onClick={() => router.push('/dashboard/crm')}
              className="px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:bg-bg-surface text-sm bg-white"
            >
              Pipeline View
            </button>
            <button
              onClick={() => router.push('/dashboard/crm/qualification')}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Qualify Leads
            </button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, phone or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {TIER_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTierFilter(f.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                tierFilter === f.id
                  ? 'bg-accent-primary text-white'
                  : 'bg-white border border-border-subtle text-text-secondary hover:bg-bg-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-border-subtle rounded-xl p-12 flex items-center justify-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading leads...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {leads.length === 0
              ? 'Add your first lead from the CRM pipeline to get started.'
              : 'Try a different search term or tier filter.'}
          </p>
          {leads.length === 0 && (
            <button
              onClick={() => router.push('/dashboard/crm')}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90"
            >
              Go to Pipeline
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface text-left">
                  <th className="px-4 py-3 font-semibold text-text-secondary">Name</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Phone</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Company</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Tier</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Status</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-right">Score</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/crm/leads/${lead.id}`)}
                    className="border-b border-border-subtle last:border-0 hover:bg-bg-surface cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{lead.full_name || 'Unnamed'}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{lead.phone || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{lead.company || '—'}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={lead.tier} />
                    </td>
                    <td className="px-4 py-3">
                      <StagePill stage={lead.stage} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">{lead.score ?? 0}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border-subtle text-xs text-text-muted bg-bg-surface">
            Showing {filtered.length} of {leads.length} leads
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check, Lock, CreditCard } from 'lucide-react'
import { PLANS, planHas } from '@/lib/plans'

export default function AdminPlansPage() {
  const [live, setLive] = useState<{ plans?: Array<{ name: string }> } | null>(null)

  useEffect(() => {
    fetch('/api/billing/plans').then((r) => r.json()).then(setLive).catch(() => {})
  }, [])

  if (!live) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-2"><CreditCard className="w-6 h-6 text-accent-primary" /><h1 className="font-clash text-3xl font-bold text-text-primary">Billing Plans</h1></div>
      <p className="text-text-secondary text-sm mb-6">The live plan catalog served by <span className="font-mono">/api/billing/plans</span>. Lower plans deliberately exclude higher-tier features — locked items show which plan unlocks them. Change a business&apos;s plan under Tenants & Plans.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-border-subtle p-5">
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-2xl font-bold font-mono">{p.price}<span className="text-sm font-normal text-text-muted">{p.period}</span></p>
            <p className="text-xs text-text-secondary mb-3">{p.teamMembers} · {p.leadsPerMonth}</p>
            <ul className="space-y-1.5">
              {p.features.map((f) => {
                const included = planHas(p.name, f.minPlan)
                return (
                  <li key={f.label} className={`flex items-center gap-2 text-xs ${included ? 'text-text-primary' : 'text-text-muted'}`}>
                    {included ? <Check className="w-3.5 h-3.5 text-accent-emerald flex-shrink-0" /> : <Lock className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />}
                    {f.label}
                    {!included && <span className="ml-auto font-bold text-accent-gold">Needs {f.minPlan}</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

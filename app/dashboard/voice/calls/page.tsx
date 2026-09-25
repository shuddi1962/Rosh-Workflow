'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'

interface CallLog extends Record<string, unknown> {
  id: string
  direction: string | null
  status: string | null
  phone_number: string | null
  duration_seconds: number | null
  started_at: string | null
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export default function VoiceCallsPage() {
  const router = useRouter()
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/voice/calls', { credentials: 'include', headers: authHeaders() })
      if (res.status === 401) {
        const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        if (!r.ok) {
          router.replace('/login')
          return
        }
      }
      const retry = await fetch('/api/voice/calls', { credentials: 'include', headers: authHeaders() })
      const body = (await retry.json().catch(() => ({}))) as Record<string, unknown>
      if (!retry.ok) throw new Error(String(body.error || `Request failed (${retry.status})`))
      setCalls(Array.isArray(body.calls) ? (body.calls as CallLog[]) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load calls')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const fmtDur = (s: number | null) => {
    if (s === null || s === undefined || !Number.isFinite(Number(s))) return '—'
    const n = Number(s)
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
  }

  return (
    <div>
      <h1 className="font-clash text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
        <Phone className="w-7 h-7" /> Call History
      </h1>
      <p className="text-text-secondary mb-6">Live inbound and outbound calls from voice agents.</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-bg-surface border border-border-subtle" />)}
        </div>
      ) : error ? (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 text-center">
          <p className="text-text-primary font-bold">Calls unavailable</p>
          <p className="text-text-muted text-sm mt-1">{error}</p>
          <button onClick={() => load()} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold bg-accent-primary text-white">Retry</button>
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <p className="text-text-secondary text-lg mb-2">No calls yet</p>
          <p className="text-text-muted text-sm">Call logs will appear here when voice agents make or receive calls.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border-subtle">
                <th className="py-2.5 px-4">Started</th>
                <th className="py-2.5 px-4">Direction</th>
                <th className="py-2.5 px-4">Number</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-ghost">
              {calls.map((c) => (
                <tr key={String(c.id)} className="hover:bg-bg-elevated/50">
                  <td className="py-2.5 px-4 text-text-secondary whitespace-nowrap">
                    {c.started_at ? new Date(String(c.started_at)).toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4 capitalize text-text-primary font-medium">{String(c.direction ?? '—')}</td>
                  <td className="py-2.5 px-4 text-text-secondary tabular-nums">{String(c.phone_number ?? '—')}</td>
                  <td className="py-2.5 px-4 text-text-secondary">{String(c.status ?? '—')}</td>
                  <td className="py-2.5 px-4 text-right font-bold tabular-nums">{fmtDur(c.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

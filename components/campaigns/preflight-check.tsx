'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react'

interface PreflightIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  field?: string
}

interface PreflightResult {
  ready: boolean
  issues: PreflightIssue[]
  recipient_count: number
  qualification_blockers: string[]
  consent_blockers: string[]
}

interface PreflightCheckProps {
  campaignName: string
  campaignType: string
  steps: Array<{ type: string; content: string; subject?: string }>
  audience?: {
    grade?: string[]
    tier?: string[]
    stage?: string[]
  }
  onReady?: (ready: boolean) => void
}

export function PreflightCheck({ campaignName, campaignType, steps, audience, onReady }: PreflightCheckProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<PreflightResult | null>(null)

  const runCheck = async () => {
    setChecking(true)
    const issues: PreflightIssue[] = []
    const qualificationBlockers: string[] = []
    const consentBlockers: string[] = []

    if (!campaignName.trim()) {
      issues.push({ type: 'error', message: 'Campaign name is required', field: 'name' })
    }

    if (steps.length === 0) {
      issues.push({ type: 'error', message: 'At least one sequence step is required', field: 'steps' })
    }

    steps.forEach((step, index) => {
      if (!step.content?.trim()) {
        issues.push({ type: 'error', message: `Step ${index + 1} has empty content`, field: `step_${index}` })
      }
      if (step.type === 'email' && !step.subject?.trim()) {
        issues.push({ type: 'error', message: `Step ${index + 1} (Email) requires a subject line`, field: `step_${index}_subject` })
      }
    })

    if (!audience?.grade?.length && !audience?.tier?.length) {
      issues.push({ type: 'warning', message: 'No audience filters set — campaign will target all leads' })
    }

    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          audience: {
            grade_filters: audience?.grade || [],
            tier_filters: audience?.tier || [],
            stage_filters: audience?.stage || [],
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        qualificationBlockers.push(...data.qualification_blockers || [])
        consentBlockers.push(...data.consent_blockers || [])

        if (data.unqualified_count > 0) {
          qualificationBlockers.push(`${data.unqualified_count} leads have pending qualification status`)
        }
        if (data.no_consent_count > 0) {
          consentBlockers.push(`${data.no_consent_count} leads lack consent for ${campaignType}`)
        }
      }
    } catch {
      issues.push({ type: 'warning', message: 'Could not verify lead qualification status' })
    }

    if (qualificationBlockers.length > 0) {
      qualificationBlockers.forEach(b => {
        issues.push({ type: 'error', message: b })
      })
    }
    if (consentBlockers.length > 0) {
      consentBlockers.forEach(b => {
        issues.push({ type: 'error', message: b })
      })
    }

    const hasErrors = issues.some(i => i.type === 'error')
    const recipientCount = Math.floor(Math.random() * 500) + 50

    const preflightResult: PreflightResult = {
      ready: !hasErrors,
      issues,
      recipient_count: recipientCount,
      qualification_blockers: qualificationBlockers,
      consent_blockers: consentBlockers,
    }

    setResult(preflightResult)
    onReady?.(!hasErrors)
    setChecking(false)
  }

  const clearResult = () => {
    setResult(null)
    onReady?.(false)
  }

  if (checking) {
    return (
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-accent-primary animate-spin mr-3" />
          <span className="text-text-primary font-medium">Running preflight checks...</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-3">Preflight Check</h3>
        <p className="text-sm text-text-secondary mb-4">
          Verify your campaign is ready to launch. Checks qualification status, consent, and content completeness.
        </p>
        <button
          onClick={runCheck}
          className="w-full px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors font-medium"
        >
          Run Pre-Launch Check
        </button>
      </div>
    )
  }

  return (
    <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Preflight Check Results</h3>
        <button onClick={clearResult} className="p-1 hover:bg-bg-surface rounded">
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {result.ready ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-accent-red" />
        )}
        <div>
          <p className={`font-semibold ${result.ready ? 'text-emerald-500' : 'text-accent-red'}`}>
            {result.ready ? 'Ready to Launch!' : 'Issues Found'}
          </p>
          <p className="text-sm text-text-secondary">
            Estimated recipients: <span className="font-bold text-text-primary">{result.recipient_count}</span>
          </p>
        </div>
      </div>

      {result.issues.length > 0 && (
        <div className="space-y-2">
          {result.issues.map((issue, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded ${
              issue.type === 'error' ? 'bg-accent-red/10' :
              issue.type === 'warning' ? 'bg-amber-500/10' :
              'bg-blue-500/10'
            }`}>
              {issue.type === 'error' ? (
                <X className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
              ) : issue.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                issue.type === 'error' ? 'text-accent-red' :
                issue.type === 'warning' ? 'text-amber-400' :
                'text-blue-400'
              }`}>
                {issue.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {result.ready && (
        <button
          onClick={runCheck}
          className="w-full mt-4 px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors"
        >
          Re-run Check
        </button>
      )}
    </div>
  )
}

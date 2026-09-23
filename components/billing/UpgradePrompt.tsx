'use client'

import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { nextPlanWith, type PlanName } from '@/lib/plans'

export function UpgradePrompt({
  feature,
  minPlan,
  compact = false,
}: {
  feature: string
  minPlan: PlanName
  compact?: boolean
}) {
  const router = useRouter()
  const target = nextPlanWith(minPlan)
  if (compact) {
    return (
      <button
        onClick={() => router.push('/#pricing')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-gold hover:underline"
      >
        <Lock className="w-3.5 h-3.5" />
        Upgrade to {target} to unlock
      </button>
    )
  }
  return (
    <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-6 text-center">
      <div className="w-10 h-10 bg-accent-gold/15 rounded-full flex items-center justify-center mx-auto mb-3">
        <Lock className="w-5 h-5 text-accent-gold" />
      </div>
      <h3 className="font-bold text-text-primary mb-1">{feature} is on {target} and above</h3>
      <p className="text-sm text-text-secondary mb-4">Your current plan doesn&apos;t include this. Upgrade to unlock it instantly.</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={() => router.push('/#pricing')} className="bg-accent-gold text-white hover:bg-accent-gold/90">See plans & upgrade</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to overview</Button>
      </div>
    </div>
  )
}

// GrowPilot — canonical subscription plans + feature gating.
// Every plan intentionally omits some features: locked features render an
// "Upgrade to unlock" prompt instead of the feature itself.

export type PlanName = 'Starter' | 'Professional' | 'Business' | 'Enterprise'

export const PLAN_RANK: Record<PlanName, number> = {
  Starter: 0,
  Professional: 1,
  Business: 2,
  Enterprise: 3,
}

export function normalizePlan(plan: string | undefined | null): PlanName {
  const p = (plan || '').toLowerCase()
  if (p === 'growth' || p === 'professional') return 'Professional'
  if (p === 'business') return 'Business'
  if (p === 'enterprise') return 'Enterprise'
  return 'Starter'
}

export interface PlanFeature {
  label: string
  minPlan: PlanName
}

export interface Plan {
  name: PlanName
  price: string
  period: string
  yearlyPrice?: string
  desc: string
  cta: string
  highlighted: boolean
  teamMembers: string
  leadsPerMonth: string
  features: PlanFeature[]
}

export const ALL_FEATURES: PlanFeature[] = [
  { label: 'Dashboard & analytics', minPlan: 'Starter' },
  { label: 'Product catalog', minPlan: 'Starter' },
  { label: 'Inventory & warehouse', minPlan: 'Starter' },
  { label: 'Receipt custody register', minPlan: 'Starter' },
  { label: 'Daily & monthly reports', minPlan: 'Starter' },
  { label: 'Content Brain (AI posts)', minPlan: 'Starter' },
  { label: 'Social media scheduling', minPlan: 'Professional' },
  { label: 'Trend monitor', minPlan: 'Professional' },
  { label: 'Competitor intelligence', minPlan: 'Professional' },
  { label: 'CRM pipeline & lead scoring', minPlan: 'Professional' },
  { label: 'Campaigns (email/SMS/WhatsApp)', minPlan: 'Professional' },
  { label: 'Work schedules & team review', minPlan: 'Professional' },
  { label: 'UGC ad creator', minPlan: 'Business' },
  { label: 'Image & banner studio', minPlan: 'Business' },
  { label: 'Video studio', minPlan: 'Business' },
  { label: 'Voice agents & call logs', minPlan: 'Business' },
  { label: 'Automation triggers & sequences', minPlan: 'Business' },
  { label: 'URL creative scraper', minPlan: 'Business' },
  { label: 'WhatsApp inbox & auto-reply', minPlan: 'Enterprise' },
  { label: 'Reviews, referrals & print center', minPlan: 'Enterprise' },
  { label: 'Dedicated account manager', minPlan: 'Enterprise' },
  { label: 'Custom integrations & SLA', minPlan: 'Enterprise' },
]

export const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '₦29,000',
    period: '/month',
    yearlyPrice: '₦278,000/yr',
    desc: 'For small businesses getting started with operations & content',
    cta: 'Start Free Trial',
    highlighted: false,
    teamMembers: 'Up to 3 team members',
    leadsPerMonth: '1,000 leads/month',
    features: ALL_FEATURES,
  },
  {
    name: 'Professional',
    price: '₦99,000',
    period: '/month',
    yearlyPrice: '₦950,000/yr',
    desc: 'For growing businesses scaling sales & marketing',
    cta: 'Start Free Trial',
    highlighted: true,
    teamMembers: 'Up to 10 team members',
    leadsPerMonth: '10,000 leads/month',
    features: ALL_FEATURES,
  },
  {
    name: 'Business',
    price: '₦189,000',
    period: '/month',
    yearlyPrice: '₦1,815,000/yr',
    desc: 'For larger teams running creative, voice & automation',
    cta: 'Start Free Trial',
    highlighted: false,
    teamMembers: 'Up to 50 team members',
    leadsPerMonth: '50,000 leads/month',
    features: ALL_FEATURES,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    yearlyPrice: undefined,
    desc: 'For enterprises with custom needs & dedicated support',
    cta: 'Contact Sales',
    highlighted: false,
    teamMembers: 'Unlimited team members',
    leadsPerMonth: 'Unlimited leads',
    features: ALL_FEATURES,
  },
]

export function planHas(plan: string | undefined | null, minPlan: PlanName): boolean {
  return PLAN_RANK[normalizePlan(plan)] >= PLAN_RANK[minPlan]
}

export function lockedFeatures(plan: string | undefined | null): PlanFeature[] {
  const rank = PLAN_RANK[normalizePlan(plan)]
  return ALL_FEATURES.filter((f) => PLAN_RANK[f.minPlan] > rank)
}

export function nextPlanWith(minPlan: PlanName): PlanName {
  return minPlan
}

// Module → minimum plan required. Used for sidebar locks + upgrade prompts.
export const MODULE_MIN_PLAN: Record<string, PlanName> = {
  overview: 'Starter',
  content: 'Starter',
  products: 'Starter',
  inventory: 'Starter',
  documents: 'Starter',
  work: 'Professional',
  social: 'Professional',
  trends: 'Professional',
  competitors: 'Professional',
  crm: 'Professional',
  campaigns: 'Professional',
  ugc: 'Business',
  creative: 'Business',
  video: 'Business',
  voice: 'Business',
  automation: 'Business',
  whatsapp: 'Enterprise',
  analytics: 'Professional',
  settings: 'Starter',
}

export function moduleAccessible(plan: string | undefined | null, moduleKey: string): boolean {
  const min = MODULE_MIN_PLAN[moduleKey] || 'Starter'
  return planHas(plan, min)
}

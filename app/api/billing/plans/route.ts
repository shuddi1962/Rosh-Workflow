import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/plans'

// Public catalog of subscription plans (mirrors the plans table seed).
export async function GET() {
  return NextResponse.json({
    plans: PLANS.map((p) => ({
      name: p.name,
      price: p.price,
      period: p.period,
      yearlyPrice: p.yearlyPrice,
      desc: p.desc,
      cta: p.cta,
      highlighted: p.highlighted,
      teamMembers: p.teamMembers,
      leadsPerMonth: p.leadsPerMonth,
      features: p.features,
    })),
  })
}

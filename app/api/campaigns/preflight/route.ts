import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { audience } = body

    let unqualifiedCount = 0
    let noConsentCount = 0
    const qualificationBlockers: string[] = []
    const consentBlockers: string[] = []

    const { data: leads } = await db
      .from('leads')
      .select('id, qualification_status, email_consent, whatsapp_consent, sms_consent, call_consent, phone, email')

    if (leads) {
      const leadsArray = leads as unknown as Array<Record<string, unknown>>
      const filtered = leadsArray.filter(lead => {
        const grade = lead.grade as string
        const tier = lead.tier as string
        const stage = lead.stage as string
        if (audience?.grade_filters?.length && !audience.grade_filters.includes(grade)) return false
        if (audience?.tier_filters?.length && !audience.tier_filters.includes(tier)) return false
        if (audience?.stage_filters?.length && !audience.stage_filters.includes(stage)) return false
        return true
      })

      unqualifiedCount = filtered.filter(l => l.qualification_status === 'pending').length
      noConsentCount = filtered.filter(l => !l.email_consent && !l.whatsapp_consent).length

      if (unqualifiedCount > 0) {
        qualificationBlockers.push(`${unqualifiedCount} leads have pending qualification`)
      }
    }

    return NextResponse.json({
      unqualified_count: unqualifiedCount,
      no_consent_count: noConsentCount,
      qualification_blockers: qualificationBlockers,
      consent_blockers: consentBlockers,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

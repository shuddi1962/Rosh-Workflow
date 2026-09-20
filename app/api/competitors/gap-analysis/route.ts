import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: competitors, error } = await db
      .from('competitors')
      .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const compList = competitors || []
    const contentGaps: string[] = []
    const audienceGaps: string[] = []
    const offerGaps: string[] = []
    const roshanalWeaknesses: Array<{ weakness: string; competitor_doing_it: string; recommended_fix: string; priority: 'critical' | 'high' | 'medium' }> = []

    for (const comp of compList) {
      const compObj = comp as unknown as Record<string, unknown>
      const intelReport = compObj.intel_report as Record<string, unknown> | null

      if (intelReport && (intelReport.content_gaps as string[])) {
        contentGaps.push(...(intelReport.content_gaps as string[]))
      }
      if (intelReport && (intelReport.audience_gaps as string[])) {
        audienceGaps.push(...(intelReport.audience_gaps as string[]))
      }
      if (intelReport && (intelReport.offer_gaps as string[])) {
        offerGaps.push(...(intelReport.offer_gaps as string[]))
      }
      if (intelReport && (intelReport.roshanal_weaknesses as typeof roshanalWeaknesses)) {
        roshanalWeaknesses.push(...(intelReport.roshanal_weaknesses as typeof roshanalWeaknesses))
      }
    }

    return NextResponse.json({
      report: {
        content_gaps: [...new Set(contentGaps)],
        audience_gaps: [...new Set(audienceGaps)],
        offer_gaps: [...new Set(offerGaps)],
        roshanal_weaknesses: roshanalWeaknesses,
        competitors_scanned: compList.length,
        generated_at: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

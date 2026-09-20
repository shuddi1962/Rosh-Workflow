import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: competitor, error: fetchError } = await db
      .from('competitors')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const compObj = competitor as unknown as Record<string, unknown>
    const facebookUrl = compObj.facebook_url as string
    const instagramUrl = compObj.instagram_url as string
    const website = compObj.website as string

    const intelReport = {
      scanned_at: new Date().toISOString(),
      sources: { facebook: facebookUrl, instagram: instagramUrl, website },
      status: 'pending',
      message: 'Scrape job queued. Results will be available shortly.'
    }

    const { data, error } = await db
      .from('competitors')
      .update({
        last_scanned: new Date().toISOString(),
        intel_report: intelReport
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Scrape initiated', competitor: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

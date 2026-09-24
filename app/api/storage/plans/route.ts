import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/storage/plans — admin-configurable catalog (no hardcoded prices)
export async function GET() {
  const { data, error } = await db.from('storage_plans').select('*').eq('is_active', true).limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const plans = (((data as unknown as Row[]) || []).sort((a, b) => Number(a.rank) - Number(b.rank)))
  return NextResponse.json({ plans })
}

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { validateEnv } = await import('@/lib/env')
    validateEnv()
    return NextResponse.json({ valid: true, message: 'Environment configured correctly' })
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}

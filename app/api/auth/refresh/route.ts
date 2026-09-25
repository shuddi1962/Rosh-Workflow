import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateTokens } from '@/lib/auth'

// POST /api/auth/refresh — silent session renewal using the httpOnly
// refresh_token cookie (7d). Issues a fresh 15-minute access_token cookie
// so workspace switches never bounce to /login mid-session.
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const payload = verifyToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    const { accessToken } = generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      department: payload.department,
      staffRole: payload.staffRole,
      businessId: payload.businessId ?? null,
    })

    const response = NextResponse.json({ user: payload })
    response.cookies.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Refresh failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

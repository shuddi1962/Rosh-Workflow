import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let email: string, password: string

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      email = body.email
      password = body.password
    } else {
      const formData = await request.formData()
      email = formData.get('email') as string
      password = formData.get('password') as string
    }
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    
    const result = await authenticateUser(email, password)
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        role: result.user.role
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })
    
    response.cookies.set({
      name: 'access_token',
      value: result.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60
    })
    
    response.cookies.set({
      name: 'refresh_token',
      value: result.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })
    
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

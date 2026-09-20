import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      const userToken = (request as Request & { cookies?: { get: (name: string) => { value?: string } } }).cookies?.get('access_token')?.value
      if (!userToken && !token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const division = searchParams.get('division')
    const category = searchParams.get('category')

    let query = db.from('products').select('*').order('created_at', { ascending: false })

    if (division) {
      query = query.eq('division', division)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.name || !body.division || !body.category) {
      return NextResponse.json({ error: 'name, division, and category are required' }, { status: 400 })
    }

    const { data, error } = await db
      .from('products')
      .insert({
        ...body,
        features: body.features || [],
        specifications: body.specifications || {},
        images: body.images || [],
        keywords: body.keywords || [],
        is_new_arrival: body.is_new_arrival || false,
        is_featured: body.is_featured || false,
        is_available: body.is_available !== false,
        installation_required: body.installation_required || false,
        installation_area: body.installation_area || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

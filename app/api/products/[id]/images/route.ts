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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { images } = await request.json()

    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'images array is required' }, { status: 400 })
    }

    const { data: product } = await db
      .from('products')
      .select('images')
      .eq('id', params.id)
      .single()

    const existingImages = product ? (product as unknown as Record<string, unknown>).images as unknown[] || [] : []
    const updatedImages = [...existingImages, ...images]

    const { data, error } = await db
      .from('products')
      .update({ images: updatedImages, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

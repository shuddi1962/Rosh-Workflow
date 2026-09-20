import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { trend_id, product_id } = await request.json()

    if (!trend_id || !product_id) {
      return NextResponse.json({ error: 'trend_id and product_id are required' }, { status: 400 })
    }

    const { data: product, error: productError } = await db
      .from('products')
      .select('keywords')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: trend, error: trendError } = await db
      .from('trends')
      .select('*')
      .eq('id', trend_id)
      .single()

    if (trendError || !trend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 })
    }

    const trendObj = trend as unknown as Record<string, unknown>
    const productObj = product as unknown as Record<string, unknown>
    const keywords = (productObj.keywords as string[]) || []
    const matchedProducts = (trendObj.matched_products as string[]) || []

    if (!matchedProducts.includes(product_id)) {
      matchedProducts.push(product_id)
      await db
        .from('trends')
        .update({ matched_products: matchedProducts })
        .eq('id', trend_id)
    }

    return NextResponse.json({
      match: true,
      trend: trendObj,
      product: productObj,
      relevance_score: keywords.length * 10
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

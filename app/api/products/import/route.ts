import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { products, source_type, source_url } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Products array is required' }, { status: 400 })
    }

    const inserted: unknown[] = []
    const errors: string[] = []

    for (const product of products) {
      const productId = crypto.randomUUID()
      const { error } = await db
        .from('products')
        .insert({
          id: productId,
          division: product.division || 'tech',
          category: product.category || 'General',
          brand: product.brand || 'Unknown',
          name: product.name,
          model: product.model || '',
          description: product.description || '',
          features: product.features || [],
          specifications: product.specifications || {},
          price_naira: product.price_naira || 0,
          price_display: product.price_display || 'Contact for price',
          images: product.images || [],
          keywords: product.keywords || [],
          is_new_arrival: product.is_new_arrival || false,
          is_featured: product.is_featured || false,
          is_available: product.is_available !== false,
          installation_required: product.installation_required || false,
          installation_area: product.installation_area || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        errors.push(`Failed to import ${product.name}: ${error.message}`)
      } else {
        inserted.push(productId)

        if (source_type || source_url) {
          await db
            .from('product_sources')
            .insert({
              id: crypto.randomUUID(),
              product_id: productId,
              source_type: source_type || 'manual',
              source_url: source_url || '',
              raw_extracted_data: product,
              processed_at: new Date().toISOString(),
            })
        }
      }
    }

    return NextResponse.json({
      imported: inserted.length,
      failed: errors.length,
      errors,
      product_ids: inserted,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

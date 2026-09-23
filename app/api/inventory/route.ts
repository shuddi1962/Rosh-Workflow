import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'

const db = new DBClient()

type ProductRow = Record<string, unknown>

// GET /api/inventory?search=&division=&warehouse_id=&low_stock=true&limit=200
// Returns products enriched with per-warehouse stock + computed stock value.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').toLowerCase()
    const division = searchParams.get('division') || ''
    const warehouseId = searchParams.get('warehouse_id') || ''
    const lowStockOnly = searchParams.get('low_stock') === 'true'
    const limit = Math.min(Number(searchParams.get('limit') || 300), 1000)

    const { data: products, error } = await db.from('products').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((products as unknown as ProductRow[]) || []).map((p) => ({ ...p }))

    const { data: stockRows } = await db.from('warehouse_stock').select('*').limit(2000)
    const stock = ((stockRows as unknown as Array<Record<string, unknown>>) || []).map((s) => ({
      product_id: String(s.product_id),
      warehouse_id: String(s.warehouse_id),
      quantity: Number(s.quantity || 0),
    }))

    const qtyByProduct = new Map<string, number>()
    const qtyByProductWarehouse = new Map<string, number>()
    for (const s of stock) {
      qtyByProduct.set(s.product_id, (qtyByProduct.get(s.product_id) || 0) + s.quantity)
      qtyByProductWarehouse.set(`${s.product_id}::${s.warehouse_id}`, s.quantity)
    }

    rows = rows.map((p) => {
      const id = String(p.id)
      const distributed = qtyByProduct.get(id)
      const qoh = distributed !== undefined ? distributed : Number(p.quantity_on_hand || 0)
      const cost = Number(p.cost_price_naira || 0)
      const price = Number(p.price_naira || 0)
      return {
        ...p,
        quantity_on_hand: qoh,
        stock_value_cost: qoh * cost,
        stock_value_price: qoh * price,
        warehouse_quantity: warehouseId ? qtyByProductWarehouse.get(`${id}::${warehouseId}`) || 0 : undefined,
      }
    })

    if (division) rows = rows.filter((p) => String(p.division) === division)
    if (warehouseId) {
      const inWarehouse = new Set(stock.filter((s) => s.warehouse_id === warehouseId).map((s) => s.product_id))
      rows = rows.filter((p) => inWarehouse.has(String(p.id)) || Number(p.quantity_on_hand || 0) > 0)
    }
    if (search) {
      rows = rows.filter((p) =>
        `${String(p.name || '')} ${String(p.brand || '')} ${String(p.category || '')} ${String(p.sku || '')}`.toLowerCase().includes(search)
      )
    }
    if (lowStockOnly) {
      rows = rows.filter((p) => Number(p.quantity_on_hand || 0) <= Number(p.reorder_level || 0))
    }

    return NextResponse.json({ items: rows, count: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/inventory — create product with inventory fields (operator+ allowed)
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!body.division) return NextResponse.json({ error: 'division is required' }, { status: 400 })

    const priceNaira = body.price_naira === null || body.price_naira === undefined || body.price_naira === '' ? null : Number(body.price_naira)
    const costPrice = body.cost_price_naira === null || body.cost_price_naira === undefined || body.cost_price_naira === '' ? null : Number(body.cost_price_naira)
    const qoh = Number(body.quantity_on_hand || 0)
    if (qoh < 0) return NextResponse.json({ error: 'quantity_on_hand cannot be negative' }, { status: 400 })

    const { data, error } = await db
      .from('products')
      .insert({
        division: String(body.division),
        category: String(body.category || 'General'),
        brand: String(body.brand || ''),
        name,
        model: String(body.model || ''),
        description: String(body.description || ''),
        features: Array.isArray(body.features) ? body.features : [],
        specifications: (body.specifications as Record<string, unknown>) || {},
        price_naira: priceNaira,
        price_display: String(body.price_display || (priceNaira ? `₦${Number(priceNaira).toLocaleString()}` : '')),
        images: Array.isArray(body.images) ? body.images : [],
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
        is_new_arrival: Boolean(body.is_new_arrival),
        is_featured: Boolean(body.is_featured),
        is_available: body.is_available !== false,
        availability_note: String(body.availability_note || ''),
        warranty: String(body.warranty || ''),
        installation_required: Boolean(body.installation_required),
        installation_area: Array.isArray(body.installation_area) ? body.installation_area : [],
        sku: String(body.sku || ''),
        unit_of_measure: String(body.unit_of_measure || 'pcs'),
        quantity_on_hand: qoh,
        reorder_level: Number(body.reorder_level || 0),
        minimum_stock_level: Number(body.minimum_stock_level || 0),
        cost_price_naira: costPrice,
        supplier: String(body.supplier || ''),
        warehouse_location: String(body.warehouse_location || 'Main Warehouse'),
        stock_status: String(body.stock_status || (qoh > 0 ? 'in_stock' : 'out_of_stock')),
        image_url: String(body.image_url || ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const created = data as unknown as Record<string, unknown>
    // Opening balance movement (auditable, never silent)
    if (qoh > 0) {
      const ref = `OP-${Date.now().toString(36).toUpperCase()}`
      await db.from('inventory_movements').insert({
        reference_number: ref,
        movement_type: 'opening_balance',
        product_id: String(created.id),
        warehouse_id: (body.warehouse_id as string) || null,
        quantity: qoh,
        previous_quantity: 0,
        new_quantity: qoh,
        source_destination: 'Opening balance',
        person_responsible: auth.user.name || auth.user.email,
        reason: 'Initial stock on product creation',
        related_document_type: 'product',
        related_document_id: String(created.id),
        notes: '',
        created_by: auth.user.userId,
        created_at: new Date().toISOString(),
      })
    }
    await audit(auth.user.userId, 'inventory.create', 'product', String(created.id), { name }, request)
    return NextResponse.json({ item: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

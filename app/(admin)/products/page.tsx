import Link from 'next/link'

export default async function AdminProductsPage() {
  const { insforgeAdmin } = await import('@/lib/insforge/client')
  const { data: products } = await insforgeAdmin
    .database
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">Product Catalog</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Add Product</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product: any) => (
          <div key={product.id} className="bg-bg-surface rounded-lg border border-border-subtle p-6 hover:border-border-hover transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-clash font-semibold text-text-primary">{product.name}</h3>
                <p className="text-text-muted text-sm">{product.brand} • {product.category}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${product.division === 'marine' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-purple/20 text-accent-purple'}`}>
                {product.division}
              </span>
            </div>
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-accent-gold font-jetbrains">{product.price_display}</span>
              <div className="space-x-2">
                <Link href={`/admin/products/${product.id}/edit`} className="text-accent-primary text-sm">Edit</Link>
                <span className="text-text-muted">|</span>
                <span className="text-accent-red text-sm cursor-pointer">Delete</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-text-muted">
          <p>No products yet. Add your first product to get started.</p>
        </div>
      )}
    </div>
  )
}

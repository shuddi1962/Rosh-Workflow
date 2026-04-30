import Link from 'next/link'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export default async function AdminProductsPage() {
  const { data: products } = await db
    .from('products')
    .select('*')
  
  const productsList = (products as Array<Record<string, unknown>>) || []
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">Product Catalog</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Add Product</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsList.map((product) => (
          <div key={product.id as string} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-clash font-semibold text-gray-900">{product.name as string}</h3>
                <p className="text-gray-500 text-sm">{product.brand as string} &bull; {product.category as string}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${product.division === 'marine' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {product.division as string}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description as string}</p>
            <div className="flex justify-between items-center">
              <span className="text-amber-600 font-jetbrains">{product.price_display as string}</span>
              <div className="space-x-2">
                <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 text-sm">Edit</Link>
                <span className="text-gray-400">|</span>
                <span className="text-red-600 text-sm cursor-pointer">Delete</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {productsList.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No products yet. Add your first product to get started.</p>
        </div>
      )}
    </div>
  )
}

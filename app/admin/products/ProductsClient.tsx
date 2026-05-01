'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  division: string
  price_display: string
  description: string
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        alert('Product deleted successfully!')
      } else {
        alert('Failed to delete product')
      }
    } catch {
      alert('Error deleting product')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">Product Catalog</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Add Product
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-gray-300 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-clash font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-500 text-sm">{product.brand} • {product.category}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${product.division === 'marine' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {product.division}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-amber-600 font-mono font-medium">{product.price_display}</span>
              <button
                onClick={() => deleteProduct(product.id)}
                className="text-red-600 text-sm hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No products yet. Add your first product to get started.</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Package, ArrowUpRight, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Product {
  id: string
  division: string
  category: string
  brand: string
  name: string
  model: string
  description: string
  features: string[]
  price_naira: number | null
  price_display: string
  images: Array<{ url: string; alt: string }>
  keywords: string[]
  is_new_arrival: boolean
  is_featured: boolean
  is_available: boolean
  created_at: string
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterDivision, setFilterDivision] = useState('all')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchesDivision = filterDivision === 'all' || p.division === filterDivision
    return matchesSearch && matchesDivision
  })

  const marineCount = products.filter(p => p.division === 'marine').length
  const techCount = products.filter(p => p.division === 'tech').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
            <p className="text-gray-600">Browse marine and technology products for content generation</p>
          </div>
          <Link href="/admin/products">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ExternalLink className="w-4 h-4 mr-2" />
              Full Management (Admin)
            </Button>
          </Link>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Total Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Marine Division</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 font-mono">{marineCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Tech Division</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 font-mono">{techCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products by name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            <SelectItem value="marine">Marine Division</SelectItem>
            <SelectItem value="tech">Technology Division</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={fetchProducts}
          variant="outline"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No products found. Add products via the admin panel.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={product.division === 'marine' ? 'default' : 'info'}
                    className={product.division === 'marine' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                    {product.division}
                  </Badge>
                  {product.is_new_arrival && (
                    <Badge className="bg-green-100 text-green-800">New</Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                  )}
                </div>

                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand} {product.model}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 font-mono">
                    {product.price_display || (product.price_naira ? `₦${product.price_naira.toLocaleString()}` : 'Contact for price')}
                  </span>
                  <Badge variant={product.is_available ? 'default' : 'error'}
                    className={product.is_available ? 'bg-green-100 text-green-800' : ''}>
                    {product.is_available ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>

                {product.category && (
                  <p className="text-xs text-gray-500 mt-2">{product.category}</p>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

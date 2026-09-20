'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Upload, Plus, X } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const [division, setDivision] = useState<'marine' | 'tech'>('tech')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name || !category || !brand) return
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          division,
          name,
          category,
          brand,
          price_display: price ? `₦${Number(price).toLocaleString()}` : 'Contact for price',
          price_naira: price ? Number(price) : null,
          description,
          features: [],
          specifications: {},
          keywords: [],
          is_new_arrival: false,
          is_featured: false,
          is_available: true,
          installation_required: division === 'tech',
          installation_area: ['Port Harcourt'],
          images: [],
        }),
      })
      router.push('/dashboard/products')
    } catch {
      console.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash text-3xl font-bold text-text-primary">Add Product</h1>
        <p className="text-text-secondary mt-1">Add a new product to the catalog</p>
      </div>

      <div className="max-w-2xl bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Division</label>
          <select value={division} onChange={e => setDivision(e.target.value as 'marine' | 'tech')} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary">
            <option value="tech">Technology & Surveillance</option>
            <option value="marine">Marine Equipment</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Product Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" placeholder="e.g. Hikvision 4CH DVR Kit" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Brand</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" placeholder="e.g. Hikvision" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Category</label>
          <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" placeholder="e.g. CCTV Systems" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Price (₦)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" placeholder="e.g. 85000" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" rows={3} placeholder="Product description..." />
        </div>

        <div className="border border-dashed border-border-subtle rounded-lg p-8 text-center">
          <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-secondary">Drop product images here or click to upload</p>
          <p className="text-xs text-text-muted mt-1">PNG, JPG up to 5MB each</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !name} className="flex-1 px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button onClick={() => router.back()} className="px-4 py-2.5 border border-border-subtle text-text-secondary rounded-lg hover:bg-bg-elevated text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

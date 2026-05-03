import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DBClient } from '@/lib/insforge/server'

export default async function NewProductPage() {
  async function createProduct(formData: FormData) {
    'use server'
    const db = new DBClient()
    
    await db.from('products').insert({
      division: formData.get('division'),
      category: formData.get('category'),
      brand: formData.get('brand'),
      name: formData.get('name'),
      description: formData.get('description'),
      price_display: formData.get('price_display'),
      features: (formData.get('features') as string)?.split('\n').filter(Boolean) || [],
      keywords: (formData.get('keywords') as string)?.split(',').map(k => k.trim()).filter(Boolean) || [],
      is_available: true,
      installation_required: false,
      installation_area: [],
      images: [],
      specifications: {}
    })
    
    redirect('/admin/products')
  }
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-6">Add New Product</h1>
      <form action={createProduct} className="space-y-6 bg-white p-6 rounded-lg border border-border-subtle">
        <div>
          <label className="block text-text-secondary mb-2">Division</label>
          <select name="division" required className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary">
            <option value="marine">Marine</option>
            <option value="tech">Technology & Surveillance</option>
          </select>
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Category</label>
          <input name="category" required className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Brand</label>
          <input name="brand" required className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Product Name</label>
          <input name="name" required className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Description</label>
          <textarea name="description" rows={4} required className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Price Display</label>
          <input name="price_display" placeholder="e.g., ₦1,500,000" className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Features (one per line)</label>
          <textarea name="features" rows={4} className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Keywords (comma-separated)</label>
          <input name="keywords" placeholder="e.g., outboard, suzuki, engine" className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary" />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-accent-primary to-indigo-600 text-white rounded-lg font-medium">Save Product</button>
          <Link href="/admin/products" className="px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:bg-bg-surface">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

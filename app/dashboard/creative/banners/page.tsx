'use client'

import { useState } from 'react'
import { Sparkles, Image, Loader2, Download } from 'lucide-react'

const BANNER_STYLES = [
  { id: 'product_launch', label: 'Product Launch', description: 'Bold new arrival announcement' },
  { id: 'price_post', label: 'Price Post', description: 'Transparent pricing with specs' },
  { id: 'seasonal', label: 'Seasonal Offer', description: 'Rainy season, New Year promos' },
  { id: 'testimonial', label: 'Testimonial', description: 'Customer quote with product' },
  { id: 'comparison', label: 'Comparison', description: 'Product A vs Product B' },
  { id: 'urgent', label: 'Urgency/Last Call', description: 'Limited stock, time-sensitive' },
]

const SIZES = [
  { id: '1080x1080', label: 'Instagram Square (1080×1080)' },
  { id: '1080x1920', label: 'Story/Reel (1080×1920)' },
  { id: '1200x628', label: 'Facebook Post (1200×628)' },
  { id: '1500x500', label: 'Twitter Header (1500×500)' },
  { id: '1128x191', label: 'LinkedIn Cover (1128×191)' },
  { id: '2560x1440', label: 'YouTube Banner (2560×1440)' },
]

export default function BannerStudioPage() {
  const [division, setDivision] = useState('tech')
  const [style, setStyle] = useState('product_launch')
  const [size, setSize] = useState('1080x1080')
  const [product, setProduct] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedBanners, setGeneratedBanners] = useState<string[]>([])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(true)
      setGeneratedBanners(prev => [...prev, `banner-${Date.now()}`])
    }, 3000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash text-3xl font-bold text-gray-900">Banner Studio</h1>
        <p className="text-gray-600 mt-1">Generate marketing banners with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Banner Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Division</label>
                <select value={division} onChange={e => setDivision(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option value="tech">Technology & Surveillance</option>
                  <option value="marine">Marine Equipment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Size</label>
                <select value={size} onChange={e => setSize(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  {SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product (optional)</label>
              <input type="text" value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Hikvision CCTV 4CH Kit" className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Style</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BANNER_STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={`p-3 rounded-lg border text-left transition-all ${style === s.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="text-sm font-medium text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Banner
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Banner preview</p>
                <p className="text-xs mt-1">{size}</p>
              </div>
            </div>
          </div>

          {generatedBanners.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Generated ({generatedBanners.length})</h3>
              <div className="space-y-2">
                {generatedBanners.map((b, i) => (
                  <div key={b} className="flex items-center justify-between p-2 rounded border border-gray-200">
                    <span className="text-sm text-gray-600">Banner {i + 1}</span>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Download className="w-4 h-4 text-gray-400" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

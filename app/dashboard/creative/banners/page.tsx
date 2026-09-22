'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Image as ImageIcon, Loader2, Download, Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

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

interface GeneratedBanner {
  id: string
  image_url: string
  size: string
  style: string
}

export default function BannerStudioPage() {
  const [division, setDivision] = useState('tech')
  const [style, setStyle] = useState('product_launch')
  const [size, setSize] = useState('1080x1080')
  const [product, setProduct] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generatedBanners, setGeneratedBanners] = useState<GeneratedBanner[]>([])

  const handleGenerate = async (): Promise<void> => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          division,
          banner_type: style,
          style,
          size,
          text_overlay: product,
          include_contact: true,
        }),
      })
      const data = await res.json() as { banner?: GeneratedBanner; error?: string }
      if (!res.ok) throw new Error(data.error || 'Banner generation failed')
      if (data.banner) {
        setGeneratedBanners(prev => [data.banner as GeneratedBanner, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = (banner: GeneratedBanner, index: number): void => {
    const link = document.createElement('a')
    link.href = banner.image_url
    link.download = `roshanal-banner-${banner.style}-${index + 1}.png`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Creative Studio"
        title="Banner Studio"
        description="Promo banners sized for WhatsApp, social and print."
        icon={Megaphone}
        actions={
          <Link
            href="/dashboard/creative/library"
            className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-bg-surface"
          >
            Open Library
          </Link>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Banner Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="banner-division" className="block text-sm text-text-secondary mb-1">Division</label>
                <select id="banner-division" value={division} onChange={e => setDivision(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary">
                  <option value="tech">Technology & Surveillance</option>
                  <option value="marine">Marine Equipment</option>
                </select>
              </div>
              <div>
                <label htmlFor="banner-size" className="block text-sm text-text-secondary mb-1">Size</label>
                <select id="banner-size" value={size} onChange={e => setSize(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary">
                  {SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="banner-product" className="block text-sm text-text-secondary mb-1">Product (optional)</label>
              <input id="banner-product" type="text" value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Hikvision CCTV 4CH Kit" className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary placeholder:text-text-muted" />
            </div>
          </div>

          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Style</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BANNER_STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={`p-3 rounded-lg border text-left transition-all ${style === s.id ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary' : 'border-border-subtle hover:border-accent-primary/40'}`}>
                  <p className="text-sm font-medium text-text-primary">{s.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full px-4 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {generating ? 'Generating...' : 'Generate Banner'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Preview</h3>
            <div className="aspect-square bg-bg-surface rounded-lg flex items-center justify-center overflow-hidden">
              {generatedBanners.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={generatedBanners[0].image_url} alt="Latest banner" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-text-muted">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Banner preview</p>
                  <p className="text-xs mt-1">{size}</p>
                </div>
              )}
            </div>
          </div>

          {generatedBanners.length > 0 && (
            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">Generated ({generatedBanners.length})</h3>
              <div className="space-y-2">
                {generatedBanners.map((b, i) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg border border-border-subtle">
                    <span className="text-sm text-text-secondary">Banner {generatedBanners.length - i} · {b.style}</span>
                    <button onClick={() => handleDownload(b, i)} className="p-1.5 hover:bg-bg-surface rounded" aria-label={`Download banner ${i + 1}`}>
                      <Download className="w-4 h-4 text-text-secondary" />
                    </button>
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

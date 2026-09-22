'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Loader2, Package, ExternalLink, Globe, Clapperboard, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface ScrapedCreative {
  title: string
  description: string
  price?: string
  images: string[]
  videos: string[]
  specs: Record<string, string>
  source_url: string
}

export default function URLScraperPage() {
  const [url, setUrl] = useState('')
  const [division, setDivision] = useState<'marine' | 'tech'>('tech')
  const [scraping, setScraping] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScrapedCreative | null>(null)
  const [message, setMessage] = useState('')

  const handleScrape = async (): Promise<void> => {
    if (!url) return
    setScraping(true)
    setError('')
    setResult(null)
    setMessage('')
    try {
      const res = await fetch('/api/scraper/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, division }),
      })
      const data = await res.json() as { creative?: ScrapedCreative; message?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Scrape failed')
      if (data.creative) {
        setResult(data.creative)
        setMessage(data.message || '')
      } else {
        setError('No product data found at that URL.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setScraping(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Creative Studio"
        title="URL Scraper"
        description="Pull product photos, prices and specs from any supplier URL."
        icon={Globe}
      />

      <div className="bg-white border border-border-subtle rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste product URL (e.g. https://example.com/hikvision-camera)"
            className="flex-1 p-3 border border-border-subtle rounded-lg text-sm bg-white text-text-primary placeholder:text-text-muted"
            onKeyDown={e => e.key === 'Enter' && void handleScrape()}
          />
          <select
            value={division}
            onChange={e => setDivision(e.target.value as 'marine' | 'tech')}
            className="p-3 border border-border-subtle rounded-lg text-sm bg-white text-text-primary"
            aria-label="Division"
          >
            <option value="tech">Technology</option>
            <option value="marine">Marine</option>
          </select>
          <button onClick={() => void handleScrape()} disabled={scraping || !url} className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium">
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scrape
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">Extracts: product name, description, price, specs, images, keywords</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      {scraping && (
        <div className="bg-white border border-border-subtle rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary mx-auto mb-4" />
          <p className="text-text-primary font-medium">Scraping page content...</p>
          <p className="text-text-secondary text-sm mt-1">Extracting product data, images, and specifications</p>
        </div>
      )}

      {!scraping && !result && !error && (
        <div className="bg-white border border-border-subtle rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No products scraped yet</h3>
          <p className="text-text-secondary text-sm">Try a URL with product listings or a single product page.</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-border-subtle rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{result.title || 'Untitled product'}</h3>
              {result.price && <p className="text-sm text-accent-primary font-medium mt-1">{result.price}</p>}
              {message && <p className="text-xs text-text-muted mt-1">{message}</p>}
            </div>
            <a
              href={result.source_url || url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-accent-primary hover:underline flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Source
            </a>
          </div>

          {result.description && (
            <p className="text-sm text-text-secondary mb-4">{result.description}</p>
          )}

          {Object.keys(result.specs).length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(result.specs).map(([key, value]) => (
                    <tr key={key} className="border-t border-border-subtle">
                      <td className="py-2 pr-4 text-text-secondary font-medium whitespace-nowrap">{key}</td>
                      <td className="py-2 text-text-primary">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-text-primary mb-2">Images ({result.images.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.images.slice(0, 8).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`${result.title} ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-border-subtle" />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border-subtle">
            <Link
              href="/dashboard/creative/ugc"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" /> Send to UGC Studio
            </Link>
            <Link
              href="/dashboard/creative/video"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-bg-surface font-medium"
            >
              <Clapperboard className="w-4 h-4" /> Send to Video Studio
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

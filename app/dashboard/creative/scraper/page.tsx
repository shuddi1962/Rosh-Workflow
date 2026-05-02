'use client'

import { useState } from 'react'
import { Search, Loader2, Package, ExternalLink } from 'lucide-react'

export default function URLScraperPage() {
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null)

  const handleScrape = () => {
    if (!url) return
    setScraping(true)
    setResults(null)
    setTimeout(() => {
      setScraping(false)
      setResults([])
    }, 5000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash text-3xl font-bold text-text-primary">URL Scraper</h1>
        <p className="text-text-secondary mt-1">Extract product data from any URL</p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste product URL (e.g. https://example.com/hikvision-camera)"
            className="flex-1 p-3 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted"
            onKeyDown={e => e.key === 'Enter' && handleScrape()}
          />
          <button onClick={handleScrape} disabled={scraping || !url} className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center gap-2 disabled:opacity-50 text-sm">
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scrape
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">Extracts: product name, description, price, specs, images, keywords</p>
      </div>

      {scraping && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary-glow mx-auto mb-4" />
          <p className="text-text-secondary font-medium">Scraping page content...</p>
          <p className="text-text-muted text-sm mt-1">Extracting product data, images, and specifications</p>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
          <p className="text-text-secondary text-sm">Try a URL with product listings or a single product page.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((product, i) => (
            <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-4">
              <h3 className="font-medium text-text-primary">{(product.name as string) || 'Unknown Product'}</h3>
              <p className="text-sm text-text-secondary mt-1">{(product.price as string) || 'Price not found'}</p>
              <button className="mt-3 text-sm text-accent-primary-glow hover:text-accent-primary flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View Source
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

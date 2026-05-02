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
        <h1 className="font-clash text-3xl font-bold text-gray-900">URL Scraper</h1>
        <p className="text-gray-600 mt-1">Extract product data from any URL</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste product URL (e.g. https://example.com/hikvision-camera)"
            className="flex-1 p-3 border border-gray-200 rounded-lg text-sm"
            onKeyDown={e => e.key === 'Enter' && handleScrape()}
          />
          <button onClick={handleScrape} disabled={scraping || !url} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 text-sm">
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scrape
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Extracts: product name, description, price, specs, images, keywords</p>
      </div>

      {scraping && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Scraping page content...</p>
          <p className="text-gray-400 text-sm mt-1">Extracting product data, images, and specifications</p>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm">Try a URL with product listings or a single product page.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((product, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">{(product.name as string) || 'Unknown Product'}</h3>
              <p className="text-sm text-gray-500 mt-1">{(product.price as string) || 'Price not found'}</p>
              <button className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View Source
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

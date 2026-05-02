'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image, Video, Filter, Search, Download, Trash2, Eye, Grid, List } from 'lucide-react'

interface Asset {
  id: string
  type: 'image' | 'video' | 'banner'
  title: string
  url: string
  thumbnail?: string
  division: 'marine' | 'tech'
  created_at: string
  size: string
  format: string
  used_in_campaigns: number
}

export default function CreativeLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/creative/library', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAssets(data.assets || [])
      }
    } catch {
      setAssets([
        { id: '1', type: 'image', title: 'Marine Engine Showcase', url: '', division: 'marine', created_at: '2024-01-15', size: '1080x1080', format: 'PNG', used_in_campaigns: 3 },
        { id: '2', type: 'banner', title: 'CCTV Security Promo', url: '', division: 'tech', created_at: '2024-01-20', size: '1200x630', format: 'PNG', used_in_campaigns: 5 },
        { id: '3', type: 'video', title: 'Solar Installation Demo', url: '', division: 'tech', created_at: '2024-02-01', size: '1080x1920', format: 'MP4', used_in_campaigns: 2 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filtered = assets.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || a.type === typeFilter
    const matchesDivision = divisionFilter === 'all' || a.division === divisionFilter
    return matchesSearch && matchesType && matchesDivision
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary">Creative Library</h1>
          <p className="text-text-secondary mt-1">All your generated images, videos, and banners in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-accent-primary/20 text-accent-primary-glow' : 'text-text-muted hover:bg-bg-surface'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-accent-primary/20 text-accent-primary-glow' : 'text-text-muted hover:bg-bg-surface'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          {['all', 'image', 'video', 'banner'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                typeFilter === type
                  ? 'bg-accent-primary/20 text-accent-primary-glow'
                  : 'text-text-secondary hover:bg-bg-surface'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          {['all', 'marine', 'tech'].map(div => (
            <button
              key={div}
              onClick={() => setDivisionFilter(div)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                divisionFilter === div
                  ? 'bg-accent-primary/20 text-accent-primary-glow'
                  : 'text-text-secondary hover:bg-bg-surface'
              }`}
            >
              {div === 'all' ? 'All' : div.charAt(0).toUpperCase() + div.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(asset => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden group cursor-pointer hover:border-border-hover transition-all"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="aspect-square bg-bg-elevated flex items-center justify-center relative">
                {asset.type === 'image' || asset.type === 'banner' ? (
                  <Image className="w-12 h-12 text-text-muted" />
                ) : (
                  <Video className="w-12 h-12 text-text-muted" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                    <Download className="w-5 h-5 text-white" />
                  </button>
                </div>
                <span className="absolute top-2 left-2 text-xs px-2 py-1 bg-black/50 rounded text-white">
                  {asset.type}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-text-primary truncate">{asset.title}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                  <span>{asset.size}</span>
                  <span>{asset.format}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(asset => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex items-center gap-4 hover:border-border-hover transition-all cursor-pointer"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="w-16 h-16 bg-bg-elevated rounded-lg flex items-center justify-center flex-shrink-0">
                {asset.type === 'image' || asset.type === 'banner' ? (
                  <Image className="w-6 h-6 text-text-muted" />
                ) : (
                  <Video className="w-6 h-6 text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{asset.title}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                  <span>{asset.type}</span>
                  <span>{asset.size}</span>
                  <span>{asset.format}</span>
                  <span>Used in {asset.used_in_campaigns} campaigns</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-bg-elevated rounded-lg">
                  <Download className="w-4 h-4 text-text-muted" />
                </button>
                <button className="p-2 hover:bg-accent-red/10 rounded-lg">
                  <Trash2 className="w-4 h-4 text-accent-red" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Image className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No assets found</h3>
          <p className="text-text-secondary">Generate some images, banners, or videos to populate your library.</p>
        </div>
      )}

      {selectedAsset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAsset(null)}>
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-clash text-xl font-bold text-text-primary">{selectedAsset.title}</h3>
              <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-bg-elevated rounded">
                <Trash2 className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="aspect-video bg-bg-elevated rounded-lg flex items-center justify-center mb-4">
              {selectedAsset.type === 'image' || selectedAsset.type === 'banner' ? (
                <Image className="w-16 h-16 text-text-muted" />
              ) : (
                <Video className="w-16 h-16 text-text-muted" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Type:</span>
                <span className="ml-2 text-text-primary">{selectedAsset.type}</span>
              </div>
              <div>
                <span className="text-text-muted">Size:</span>
                <span className="ml-2 text-text-primary">{selectedAsset.size}</span>
              </div>
              <div>
                <span className="text-text-muted">Format:</span>
                <span className="ml-2 text-text-primary">{selectedAsset.format}</span>
              </div>
              <div>
                <span className="text-text-muted">Division:</span>
                <span className="ml-2 text-text-primary">{selectedAsset.division}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 px-4 py-2.5 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
              <button className="px-4 py-2.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-bg-elevated">
                Use in Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

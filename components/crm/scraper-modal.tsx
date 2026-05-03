'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ManualLeadForm from './manual-lead-form'

const SOURCE_TABS = [
  { id: 'google_maps', label: 'Google Maps' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'website', label: 'Website' },
  { id: 'custom_url', label: 'Custom URL' },
]

const KEYWORD_SUGGESTIONS = ['oil company', 'hotel', 'school', 'bank', 'boat operator', 'hospital', 'security company', 'warehouse', 'estate']

const PH_SCRAPER_AREAS = [
  'GRA Phase 1', 'GRA Phase 2', 'GRA Phase 3', 'Trans Amadi', 'D-Line',
  'Rumuola', 'Eliozu', 'Woji', 'Peter Odili Rd', 'Rumuokoro', 'Choba',
  'Borokiri', 'Mile 1-3', 'Diobu', 'Rumuadaolu',
]

const BAYELSA_AREAS = ['Yenegoa', 'Amarat', 'Ovom']
const OTHER_AREAS = ['Warri', 'Asaba', 'Calabar']

interface ScraperModalProps {
  open: boolean
  onScrape: (config: Record<string, unknown>) => void
  onClose: () => void
}

export default function ScraperModal({ open, onScrape, onClose }: ScraperModalProps) {
  const [activeTab, setActiveTab] = useState('google_maps')
  const [keywords, setKeywords] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [geoMode, setGeoMode] = useState('specific_areas')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [maxLeads, setMaxLeads] = useState(50)
  const [postScrape, setPostScrape] = useState({
    autoQualify: true,
    addAB: true,
    discardD: false,
    sendWelcome: false,
    startWhatsapp: false,
  })
  const [scraping, setScraping] = useState(false)

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw])
  }

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }

  const selectAllPH = () => setSelectedAreas(PH_SCRAPER_AREAS)
  const clearAreas = () => setSelectedAreas([])

  const handleStartScraping = () => {
    setScraping(true)
    onScrape({
      source: activeTab,
      keywords: `${keywords} ${selectedKeywords.join(' ')}`.trim(),
      geoMode,
      selectedAreas,
      maxLeads,
      postScrape,
    })
    setTimeout(() => setScraping(false), 2000)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Automated Lead Scraping</h2>
              <p className="text-sm text-gray-500 mt-1">Scrape leads from Google Maps, LinkedIn, and social platforms</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_TABS.map(tab => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>{tab.label}</button>
                  ))}
                </div>
              </div>

              {activeTab === 'google_maps' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g., oil company Port Harcourt GRA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-500 mr-1">Suggestions:</span>
                    {KEYWORD_SUGGESTIONS.map(kw => (
                      <button key={kw} type="button" onClick={() => toggleKeyword(kw)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedKeywords.includes(kw) ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}>{kw}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Geographic Area</label>
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'specific_areas', label: 'Specific Areas', icon: '📍' },
                    { id: 'city_wide', label: 'City-Wide', icon: '🗺' },
                    { id: 'radius', label: 'Radius', icon: '📐' },
                  ].map(mode => (
                    <button key={mode.id} type="button" onClick={() => setGeoMode(mode.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      geoMode === mode.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>{mode.icon} {mode.label}</button>
                  ))}
                </div>

                {geoMode === 'specific_areas' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={selectAllPH} className="text-sm text-blue-600 hover:underline">All of Rivers State</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={() => setSelectedAreas([...PH_SCRAPER_AREAS, ...BAYELSA_AREAS, ...OTHER_AREAS])} className="text-sm text-blue-600 hover:underline">All of Niger Delta</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={clearAreas} className="text-sm text-red-600 hover:underline">Clear All</button>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Port Harcourt</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PH_SCRAPER_AREAS.map(area => (
                          <label key={area} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                            selectedAreas.includes(area) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'border-gray-100 text-gray-700 hover:bg-gray-50'
                          }`}>
                            <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggleArea(area)} className="sr-only" />
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
                              selectedAreas.includes(area) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                            }`}>{selectedAreas.includes(area) ? '✓' : ''}</span>
                            {area}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bayelsa</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {BAYELSA_AREAS.map(area => (
                          <label key={area} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                            selectedAreas.includes(area) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'border-gray-100 text-gray-700 hover:bg-gray-50'
                          }`}>
                            <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggleArea(area)} className="sr-only" />
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
                              selectedAreas.includes(area) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                            }`}>{selectedAreas.includes(area) ? '✓' : ''}</span>
                            {area}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Other</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {OTHER_AREAS.map(area => (
                          <label key={area} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                            selectedAreas.includes(area) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'border-gray-100 text-gray-700 hover:bg-gray-50'
                          }`}>
                            <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggleArea(area)} className="sr-only" />
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
                              selectedAreas.includes(area) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                            }`}>{selectedAreas.includes(area) ? '✓' : ''}</span>
                            {area}
                          </label>
                        ))}
                      </div>
                    </div>

                    {selectedAreas.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500">Selected ({selectedAreas.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAreas.map(area => (
                            <span key={area} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{area}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Leads to Scrape</label>
                <select value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value={50}>50 Leads (Free tier)</option>
                  <option value={500}>500 Leads (Pro tier)</option>
                  <option value={5000}>Unlimited (Admin)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Estimated time: ~{Math.ceil(maxLeads / 100) * 45} seconds</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">After Scraping</h3>
                <div className="space-y-2.5">
                  {[
                    { key: 'autoQualify', label: 'Auto-qualify all scraped leads with AI' },
                    { key: 'addAB', label: 'Add qualified leads (A+B grade) to CRM Pipeline as New Leads' },
                    { key: 'discardD', label: 'Discard D-grade leads automatically' },
                    { key: 'sendWelcome', label: 'Send welcome email immediately to A-grade leads' },
                    { key: 'startWhatsapp', label: 'Start WhatsApp outreach to A+B grade leads' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={postScrape[opt.key as keyof typeof postScrape]} onChange={e => setPostScrape(prev => ({ ...prev, [opt.key]: e.target.checked }))} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleStartScraping} disabled={scraping || selectedAreas.length === 0} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {scraping ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scraping...
                  </>
                ) : 'Start Scraping'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

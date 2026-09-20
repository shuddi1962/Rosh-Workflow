'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Clipboard, Link, X, UserPlus, Bot, Download } from 'lucide-react'
import ManualLeadForm from './manual-lead-form'
import ScraperModal from './scraper-modal'

interface DualEntryModalProps {
  open: boolean
  onClose: () => void
  onLeadSaved: () => void
}

export default function DualEntryModal({ open, onClose, onLeadSaved }: DualEntryModalProps) {
  const [mode, setMode] = useState<'choice' | 'manual' | 'scraper'>('choice')
  const [showImportOptions, setShowImportOptions] = useState(false)

  const handleManualSave = (data: Record<string, unknown>) => {
    const token = localStorage.getItem('accessToken')
    fetch('/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.full_name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        company: data.company,
        job_title: data.job_title,
        website: data.website,
        state: data.state,
        city: data.city,
        area: data.area,
        division_interest: data.division,
        product_interests: data.products,
        customer_type: data.customer_type,
        stage: data.stage,
        source: data.source,
        notes: data.notes,
        estimated_deal_value_ngn: data.estimated_deal_value_ngn,
        next_action_date: data.next_action_date,
        score: Math.floor(Math.random() * 50) + 50,
        tier: 'warm',
        qualification_grade: 'C',
        qualification_status: data.run_ai_qualification ? 'pending' : 'qualified',
        best_channel: 'whatsapp',
      }),
    })
    .then(() => onLeadSaved())
    .catch(console.error)
  }

  const handleScrape = (config: Record<string, unknown>) => {
    const token = localStorage.getItem('accessToken')
    fetch('/api/crm/leads/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    })
    .then(() => onLeadSaved())
    .catch(console.error)
  }

  const handleImportCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = () => { onLeadSaved(); onClose(); setMode('choice') }
    input.click()
  }

  const handlePasteClipboard = async () => {
    try {
      await navigator.clipboard.readText()
      onLeadSaved()
      onClose()
      setMode('choice')
    } catch {
      /* clipboard not available */
    }
  }

  const handleImportURL = () => {
    const url = prompt('Enter URL to import leads from:')
    if (url) { onLeadSaved(); onClose(); setMode('choice') }
  }

  const handleClose = () => {
    onClose()
    setMode('choice')
    setShowImportOptions(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {mode === 'choice' ? (
              <>
                <div className="flex justify-between items-center p-6 border-b border-border-subtle">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Add New Lead</h2>
                    <p className="text-sm text-text-muted mt-1">How would you like to add leads?</p>
                  </div>
                  <button onClick={handleClose} className="p-1.5 hover:bg-bg-surface rounded-lg"><X className="w-5 h-5 text-text-muted" /></button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button type="button" onClick={() => setMode('manual')} className="p-6 border-2 border-border-subtle rounded-xl text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">Manual Entry</h3>
                      <p className="text-sm text-text-secondary">Add a single lead by filling in the form yourself</p>
                      <span className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 font-medium">Open Manual Form →</span>
                    </button>

                    <button type="button" onClick={() => setMode('scraper')} className="p-6 border-2 border-border-subtle rounded-xl text-left hover:border-purple-300 hover:bg-purple-50/50 transition-all group">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <Bot className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">Automated Scraping</h3>
                      <p className="text-sm text-text-secondary">Scrape hundreds of leads from Google Maps, LinkedIn, Social Media or Websites automatically</p>
                      <span className="inline-flex items-center gap-1 mt-4 text-sm text-purple-600 font-medium">Open Scraper →</span>
                    </button>
                  </div>

                    <div className="flex items-center gap-3 mb-6">
                      <hr className="flex-1 border-border-ghost" />
                      <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Or</span>
                      <hr className="flex-1 border-border-ghost" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={handleImportCSV} className="flex flex-col items-center gap-2 px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors">
                        <Download className="w-5 h-5 text-text-muted" />
                        <span className="text-xs text-text-secondary font-medium">Import CSV</span>
                      </button>
                      <button type="button" onClick={handlePasteClipboard} className="flex flex-col items-center gap-2 px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors">
                        <Clipboard className="w-5 h-5 text-text-muted" />
                        <span className="text-xs text-text-secondary font-medium">Paste from Clipboard</span>
                      </button>
                      <button type="button" onClick={handleImportURL} className="flex flex-col items-center gap-2 px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors">
                        <Link className="w-5 h-5 text-text-muted" />
                        <span className="text-xs text-text-secondary font-medium">Import from URL</span>
                    </button>
                  </div>
                </div>
              </>
            ) : mode === 'manual' ? (
              <>
                <div className="flex justify-between items-center p-6 border-b border-border-subtle">
                  <h2 className="text-xl font-semibold text-text-primary">Manual Lead Entry</h2>
                  <button onClick={() => setMode('choice')} className="p-1.5 hover:bg-bg-surface rounded-lg"><X className="w-5 h-5 text-text-muted" /></button>
                </div>
                <div className="p-6">
                  <ManualLeadForm onSave={handleManualSave} onCancel={() => setMode('choice')} />
                </div>
              </>
            ) : (
              <ScraperModal open={true} onScrape={handleScrape} onClose={() => setMode('choice')} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Printer, Package, Users, Image, Mail, Phone, Globe, MapPin } from 'lucide-react'

interface PrintTemplate {
  id: string
  name: string
  description: string
  icon: typeof FileText
  pages: number
  format: 'PDF' | 'PNG'
  division: 'marine' | 'tech' | 'both'
}

const PRINT_TEMPLATES: PrintTemplate[] = [
  { id: '1', name: 'Product Catalog - Marine', description: 'Full marine equipment catalog with specs, prices, and images', icon: Package, pages: 12, format: 'PDF', division: 'marine' },
  { id: '2', name: 'Product Catalog - Tech', description: 'Complete technology and surveillance solutions catalog', icon: Package, pages: 16, format: 'PDF', division: 'tech' },
  { id: '3', name: 'Company Profile', description: 'Professional company profile with divisions, contact info, and credentials', icon: Users, pages: 8, format: 'PDF', division: 'both' },
  { id: '4', name: 'Price List - Marine', description: 'Current pricing for all marine products and services', icon: FileText, pages: 4, format: 'PDF', division: 'marine' },
  { id: '5', name: 'Price List - Tech', description: 'Current pricing for all technology products and installation packages', icon: FileText, pages: 6, format: 'PDF', division: 'tech' },
  { id: '6', name: 'Business Card', description: 'Standard business card with all contact details', icon: Image, pages: 1, format: 'PNG', division: 'both' },
  { id: '7', name: 'Letterhead', description: 'Professional letterhead for official correspondence', icon: Mail, pages: 1, format: 'PDF', division: 'both' },
  { id: '8', name: 'Invoice Template', description: 'Standard invoice format for all divisions', icon: FileText, pages: 2, format: 'PDF', division: 'both' },
  { id: '9', name: 'Quotation Template', description: 'Professional quotation format with product details', icon: FileText, pages: 3, format: 'PDF', division: 'both' },
  { id: '10', name: 'Installation Certificate', description: 'Certificate of installation for CCTV/solar systems', icon: FileText, pages: 1, format: 'PDF', division: 'tech' },
  { id: '11', name: 'Warranty Card', description: 'Product warranty card template', icon: FileText, pages: 1, format: 'PDF', division: 'both' },
  { id: '12', name: 'Flyer - Marine Safety', description: 'Promotional flyer for marine safety equipment', icon: Image, pages: 1, format: 'PNG', division: 'marine' },
]

export default function PrintCenterPage() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all')
  const [generating, setGenerating] = useState<string | null>(null)

  const filtered = PRINT_TEMPLATES.filter(t =>
    selectedDivision === 'all' || t.division === selectedDivision || t.division === 'both'
  )

  const generateDocument = async (templateId: string) => {
    setGenerating(templateId)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/print/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ template_id: templateId }),
      })
    } catch {
      console.error('Failed to generate document')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary">Print Center</h1>
          <p className="text-text-secondary mt-1">Generate catalogs, profiles, flyers, and business documents</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">No 18A Rumuola/Rumuadaolu Road, Port Harcourt</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Phone className="w-4 h-4" />
            <span className="text-sm">08109522432</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Globe className="w-4 h-4" />
            <span className="text-sm">roshanalinfotech.com</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          All documents include Roshanal Infotech branding, contact information, and professional formatting.
          Generated documents are print-ready and can be downloaded as PDF or PNG.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {['all', 'marine', 'tech'].map(div => (
          <button
            key={div}
            onClick={() => setSelectedDivision(div)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedDivision === div
                ? 'bg-accent-primary/20 text-accent-primary-glow'
                : 'text-text-secondary hover:bg-bg-surface'
            }`}
          >
            {div === 'all' ? 'All Documents' : div === 'marine' ? 'Marine' : 'Technology'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-border-hover transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <template.icon className="w-6 h-6 text-accent-primary-glow" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">{template.name}</h3>
                <p className="text-xs text-text-secondary mt-1">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span>{template.pages} page{template.pages > 1 ? 's' : ''}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-bg-elevated rounded">{template.format}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                template.division === 'marine' ? 'bg-blue-500/20 text-blue-400' :
                template.division === 'tech' ? 'bg-purple-500/20 text-purple-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {template.division}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generateDocument(template.id)}
                disabled={generating === template.id}
                className="flex-1 px-3 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating === template.id ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Generate
                  </>
                )}
              </button>
              <button className="p-2 border border-border-subtle rounded-lg hover:bg-bg-elevated">
                <Printer className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import AreaSelector from './area-selector'

const PRODUCT_OPTIONS = [
  'Outboard Engines', 'Fiberglass Boats', 'Marine Safety', 'Boat Accessories',
  'Fiberglass Chemicals', 'Bilge Pumps', 'Marine Gadgets', 'Hikvision CCTV',
  'Solar Power', 'Smart Door Locks', 'Car Trackers', 'Walkie-Talkies',
  'Fire Alarms', 'Biometric Access',
]

const SOURCE_OPTIONS = [
  'Walk-in', 'WhatsApp inbound', 'Instagram DM', 'Referral', 'Phone call',
  'Facebook', 'Google', 'Other',
]

const STAGE_OPTIONS = [
  { id: 'new_leads', label: 'New Leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'closed_won', label: 'Closed Won' },
]

interface ManualLeadFormProps {
  onSave: (data: Record<string, unknown>) => void
  onSaveAddAnother?: (data: Record<string, unknown>) => void
  onSaveView?: (data: Record<string, unknown>) => void
  onCancel: () => void
  initialData?: Record<string, unknown>
  mode?: 'save' | 'save_add_another' | 'save_view'
}

export default function ManualLeadForm({ onSave, onSaveAddAnother, onSaveView, onCancel, initialData, mode = 'save' }: ManualLeadFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({
    first_name: '',
    last_name: '',
    phone: '',
    whatsapp_same_as_phone: true,
    whatsapp: '',
    email: '',
    company: '',
    job_title: '',
    website: '',
    country: 'Nigeria',
    state: 'Rivers State',
    city: 'Port Harcourt',
    area: '',
    division: 'marine',
    products: [],
    customer_type: 'individual',
    source: 'Walk-in',
    notes: '',
    stage: 'new_leads',
    estimated_deal_value_ngn: 0,
    next_action_date: '',
    run_ai_qualification: false,
    send_welcome_message: false,
  })

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const set = (key: string, value: unknown) => setFormData(prev => ({ ...prev, [key]: value }))

  const toggleProduct = (product: string) => {
    const current = (formData.products as string[]) || []
    set('products', current.includes(product) ? current.filter((p: string) => p !== product) : [...current, product])
  }

  const gatherFormData = () => ({
    ...formData,
    full_name: `${formData.first_name} ${formData.last_name}`.trim(),
    whatsapp: (formData.whatsapp_same_as_phone as boolean) ? formData.phone : formData.whatsapp,
  })

  const handleSave = () => {
    onSave(gatherFormData())
  }

  const inputClass = 'w-full px-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5'
  const sectionClass = 'mb-6'
  const sectionTitle = 'text-base font-semibold text-text-primary mb-4 flex items-center gap-2'

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name *</label>
            <input type="text" value={formData.first_name as string} onChange={e => set('first_name', e.target.value)} className={inputClass} placeholder="e.g., Emeka" />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input type="text" value={formData.last_name as string} onChange={e => set('last_name', e.target.value)} className={inputClass} placeholder="e.g., Okafor" />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input type="tel" value={formData.phone as string} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="e.g., 08123456789" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="wa-same" checked={formData.whatsapp_same_as_phone as boolean} onChange={e => set('whatsapp_same_as_phone', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-border-subtle focus:ring-blue-500" />
            <label htmlFor="wa-same" className="text-sm text-text-secondary">WhatsApp same as phone</label>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={formData.email as string} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="emeka@company.com" />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input type="text" value={formData.company as string} onChange={e => set('company', e.target.value)} className={inputClass} placeholder="e.g., NNPC" />
          </div>
          <div>
            <label className={labelClass}>Job Title</label>
            <input type="text" value={formData.job_title as string} onChange={e => set('job_title', e.target.value)} className={inputClass} placeholder="e.g., Procurement Manager" />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input type="url" value={formData.website as string} onChange={e => set('website', e.target.value)} className={inputClass} placeholder="https://" />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitle}>Location</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className={labelClass}>Country</label>
            <input type="text" value="Nigeria" disabled className={`${inputClass} bg-bg-surface`} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input type="text" value="Rivers State" disabled className={`${inputClass} bg-bg-surface`} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input type="text" value="Port Harcourt" disabled className={`${inputClass} bg-bg-surface`} />
          </div>
          <div>
            <label className={labelClass}>Area/LGA</label>
            <input type="text" value={formData.area as string} onChange={e => set('area', e.target.value)} className={inputClass} placeholder="Select area below" />
          </div>
        </div>
        <AreaSelector
          value={formData.area as string}
          onChange={(area) => set('area', area)}
        />
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitle}>Business Interest</h3>
        <div className="mb-4">
          <label className={labelClass}>Division</label>
          <div className="flex gap-4">
            {['marine', 'tech', 'both'].map(d => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="division" checked={formData.division === d} onChange={() => set('division', d)} className="h-4 w-4 text-blue-600 border-border-subtle focus:ring-blue-500" />
                <span className="text-sm text-text-secondary capitalize">{d === 'tech' ? 'Technology' : d}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className={labelClass}>Products of Interest</label>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_OPTIONS.map(p => (
              <button key={p} type="button" onClick={() => toggleProduct(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                (formData.products as string[])?.includes(p)
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-bg-surface text-text-secondary border-border-subtle hover:bg-bg-elevated'
              }`}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Customer Type</label>
          <div className="flex gap-4">
            {['individual', 'business', 'government'].map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="customer_type" checked={formData.customer_type === c} onChange={() => set('customer_type', c)} className="h-4 w-4 text-blue-600 border-border-subtle focus:ring-blue-500" />
                <span className="text-sm text-text-secondary capitalize">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitle}>Source & Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Source</label>
            <select value={formData.source as string} onChange={e => set('source', e.target.value)} className={inputClass}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea value={formData.notes as string} onChange={e => set('notes', e.target.value)} rows={3} className={inputClass} placeholder="Additional context..." />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitle}>Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Add to Stage</label>
            <select value={formData.stage as string} onChange={e => set('stage', e.target.value)} className={inputClass}>
              {STAGE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Est. Value (₦)</label>
            <input type="number" value={formData.estimated_deal_value_ngn as number} onChange={e => set('estimated_deal_value_ngn', Number(e.target.value))} className={inputClass} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Next Action Date</label>
            <input type="date" value={formData.next_action_date as string} onChange={e => set('next_action_date', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={formData.run_ai_qualification as boolean} onChange={e => set('run_ai_qualification', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-border-subtle focus:ring-blue-500" />
          <span className="text-sm text-text-secondary">Run AI qualification immediately after adding</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={formData.send_welcome_message as boolean} onChange={e => set('send_welcome_message', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-border-subtle focus:ring-blue-500" />
          <span className="text-sm text-text-secondary">Send welcome message automatically</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface">Cancel</button>
        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Lead</button>
        {onSaveAddAnother && (
          <button type="button" onClick={() => { const data = gatherFormData(); onSaveAddAnother(data) }} className="px-4 py-2 text-sm bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
            Save & Add Another
          </button>
        )}
        {onSaveView && (
          <button type="button" onClick={() => { const data = gatherFormData(); onSaveView(data) }} className="px-4 py-2 text-sm bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
            Save & View Lead →
          </button>
        )}
      </div>
    </div>
  )
}

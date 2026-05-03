'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, X, Plus, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LeadData {
  id?: string
  name?: string
  full_name?: string
  phone?: string
  email?: string | null
  company?: string | null
  location?: string
  division_interest?: string
  product_interest?: string
  product_interests?: string[]
  source?: string
  status?: string
  notes?: string
}

interface AddLeadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  lead?: LeadData | null
}

export default function AddLeadModal({ open, onClose, onSuccess, lead }: AddLeadModalProps) {
  const isEdit = !!lead?.id
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    location: 'Port Harcourt, Rivers State',
    division_interest: 'tech',
    product_interest: '',
    source: 'manual',
    status: 'new',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || lead.full_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        company: lead.company || '',
        location: lead.location || 'Port Harcourt, Rivers State',
        division_interest: lead.division_interest || 'tech',
        product_interest: Array.isArray(lead.product_interests) ? lead.product_interests.join(', ') : (lead.product_interest || ''),
        source: lead.source || 'manual',
        status: lead.status || 'new',
        notes: lead.notes || ''
      })
    } else {
      setFormData({
        name: '', phone: '', email: '', company: '',
        location: 'Port Harcourt, Rivers State', division_interest: 'tech',
        product_interest: '', source: 'manual', status: 'new', notes: ''
      })
    }
  }, [lead, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      setError('Name and phone are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('accessToken')
      const url = isEdit ? `/api/leads/${lead!.id}` : '/api/leads'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          product_interest: formData.product_interest ? formData.product_interest.split(',').map(p => p.trim()) : [],
          score: isEdit ? undefined : Math.floor(Math.random() * 50) + 50,
          tier: isEdit ? undefined : formData.source === 'walk_in' ? 'hot' : 'warm',
          last_contact: new Date().toISOString(),
          next_action: 'Follow up within 24 hours'
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save lead')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {isEdit ? <Edit3 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
            </div>
            <h3 className="font-semibold text-gray-900">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chief Emeka Okafor"
                required
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., 08123456789"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., emeka@company.com"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., NNPC"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., GRA, Port Harcourt"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="whatsapp_inquiry">WhatsApp Inquiry</SelectItem>
                  <SelectItem value="social_dm">Social Media DM</SelectItem>
                  <SelectItem value="google">Google Search</SelectItem>
                  <SelectItem value="scraping">Web Scraping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Division Interest</Label>
              <Select value={formData.division_interest} onValueChange={(v) => setFormData({ ...formData, division_interest: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marine">Marine Equipment</SelectItem>
                  <SelectItem value="tech">Technology & Surveillance</SelectItem>
                  <SelectItem value="both">Both Divisions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Products of Interest</Label>
              <Input
                value={formData.product_interest}
                onChange={(e) => setFormData({ ...formData, product_interest: e.target.value })}
                placeholder="e.g., CCTV, Solar, Engine"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional context about this lead..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isEdit ? <Edit3 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {isEdit ? 'Save Changes' : 'Add Lead'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

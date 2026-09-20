'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Plus, Copy, Trash2, Eye, Search, Filter, Check, X } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  division: 'marine' | 'tech' | 'both'
  type: string
  subject: string
  content: string
  variables: string[]
  is_active: boolean
  usage_count: number
  created_at: string
}

const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'created_at' | 'usage_count'>[] = [
  {
    name: 'Marine Introduction',
    division: 'marine',
    type: 'introduction',
    subject: 'Premium Marine Equipment in Port Harcourt — Roshanal Infotech',
    content: `Dear {{first_name}},

I hope this email meets you well. I'm reaching out from Roshanal Infotech Limited, your trusted partner for marine equipment solutions in Port Harcourt.

We specialize in:
• Suzuki & Yamaha Outboard Engines (15HP to 300HP)
• Fiberglass Boats (patrol, speedboat, passenger)
• Marine Safety Equipment & Fiberglass Chemicals

As a business operating in the Niger Delta, you know the importance of reliable marine equipment. We keep genuine parts in stock at our Port Harcourt warehouse — no need to travel to Lagos.

Would you be available for a quick boat inspection this week? Call us at 08109522432 or WhatsApp us directly.

Best regards,
Roshanal Infotech Marine Division
No 18A Rumuola/Rumuadaolu Road, Port Harcourt`,
    variables: ['first_name'],
    is_active: true,
  },
  {
    name: 'Security Awareness Follow-up',
    division: 'tech',
    type: 'follow_up',
    subject: 'Protect Your Property — CCTV Solutions Available Today',
    content: `Dear {{first_name}},

Given the recent security concerns in Port Harcourt, many property owners are asking us: "How can I protect my family and business?"

At Roshanal Infotech, we install:
• Hikvision CCTV Systems (dome, bullet, PTZ cameras)
• Smart Door Locks & Biometric Access Control
• Solar Power Systems (never worry about PHCN again)
• Car Trackers & GPS for fleet management

Our professional installation team can secure your property in 24 hours. We serve GRA, Rumuola, Eliozu, Trans Amadi, and all of Port Harcourt metropolis.

Get a free site survey today. Call 08109522432.

Stay safe,
Roshanal Infotech Technology Division`,
    variables: ['first_name'],
    is_active: true,
  },
  {
    name: 'PHCN Solar Solution',
    division: 'tech',
    type: 'promotional',
    subject: 'PHCN Off Again? Solar Power Keeps You Running',
    content: `Hello {{first_name}},

Tired of PHCN/NEPA disruptions affecting your home or business?

Our solar systems are designed for Port Harcourt's climate:
• LivFast Lithium Batteries — long-lasting, reliable
• Complete solar installation with warranty
• Professional setup by certified technicians
• Save ₦50,000+ monthly on diesel

We've installed solar systems for homes in GRA, hotels, schools, and offices across Rivers State.

See how much you can save. WhatsApp us at 08109522432 for a free quote.

Power your life,
Roshanal Infotech`,
    variables: ['first_name'],
    is_active: true,
  },
  {
    name: 'Quote Follow-up',
    division: 'both',
    type: 'quote',
    subject: 'Your Quote from Roshanal Infotech — {{product_name}}',
    content: `Dear {{first_name}},

Thank you for your interest in {{product_name}}. As discussed, here's your quote:

Product: {{product_name}}
Price: {{price_naira}}
Warranty: {{warranty}}
Installation: {{installation_note}}

This quote is valid for 14 days. We have stock available at our Port Harcourt warehouse for immediate delivery.

To confirm your order or schedule installation, call 08109522432 or reply to this email.

We look forward to serving you.

Best regards,
Roshanal Infotech Limited
No 18A Rumuola/Rumuadaolu Road, Port Harcourt
08109522432 | 08033170802`,
    variables: ['first_name', 'product_name', 'price_naira', 'warranty', 'installation_note'],
    is_active: true,
  },
  {
    name: 'New Arrival Announcement',
    division: 'marine',
    type: 'announcement',
    subject: 'Just Arrived: {{product_name}} — Limited Stock in Port Harcourt',
    content: `Dear {{first_name}},

We just received a new shipment at our Port Harcourt warehouse:

🚢 {{product_name}}
• Brand new, genuine {{brand}}
• Full warranty included
• Ready for immediate pickup or delivery
• Only {{stock_count}} units available

As one of our valued contacts, you get first access before we announce publicly.

Call now to reserve yours: 08109522432

Stock is moving fast. Don't miss out.

Roshanal Infotech Marine Division`,
    variables: ['first_name', 'product_name', 'brand', 'stock_count'],
    is_active: true,
  },
  {
    name: 'Re-engagement Campaign',
    division: 'both',
    type: 're_engagement',
    subject: 'We Miss You — Special Offer Inside',
    content: `Hello {{first_name}},

It's been a while since we last connected. We wanted to reach out with a special offer just for you.

Whether you need:
• Marine equipment for your vessels
• CCTV and security systems
• Solar power solutions
• Car trackers for your fleet

We're offering 10% off all installations booked this month.

Call us at 08109522432 or visit our showroom at 18A Rumuola Road, Port Harcourt.

Hope to hear from you soon.

Roshanal Infotech Team`,
    variables: ['first_name'],
    is_active: true,
  },
  {
    name: 'B2B Corporate Pitch',
    division: 'tech',
    type: 'b2b',
    subject: 'Enterprise Security Solutions for {{company}}',
    content: `Dear {{first_name}},

I'm writing to introduce Roshanal Infotech's enterprise security solutions for {{company}}.

We provide comprehensive security infrastructure:
• Hikvision enterprise CCTV systems
• Biometric access control for offices
• Fire alarm systems (NIMASA compliant)
• Walkie-talkies for security teams
• Maintenance contracts with 24/7 support

Our clients include banks, hotels, estates, and government agencies across Rivers State.

I'd like to schedule a brief meeting to discuss how we can secure {{company}}'s facilities. Available this week?

Contact: 08109522432 | info@roshanalinfotech.com

Professional regards,
Roshanal Infotech Enterprise Division`,
    variables: ['first_name', 'company'],
    is_active: true,
  },
  {
    name: 'Testimonial Request',
    division: 'both',
    type: 'testimonial',
    subject: 'How Was Your Experience with Roshanal Infotech?',
    content: `Dear {{first_name}},

Thank you for choosing Roshanal Infotech for your {{product_type}} needs.

We'd love to hear about your experience. Your feedback helps us improve and helps other businesses in Port Harcourt make informed decisions.

Could you take 2 minutes to share your thoughts?
• Reply to this email
• WhatsApp us at 08109522432
• Call us: 08109522432

As a thank you, we'll enter you into our monthly draw for a free maintenance check.

We appreciate your trust in us.

Warm regards,
Roshanal Infotech Limited`,
    variables: ['first_name', 'product_type'],
    is_active: true,
  },
]

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns/templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch {
      setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({
        ...t,
        id: `template_${i}`,
        created_at: new Date().toISOString(),
        usage_count: Math.floor(Math.random() * 50),
      })))
    } finally {
      setLoading(false)
    }
  }

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDivision = divisionFilter === 'all' || t.division === divisionFilter
    return matchesSearch && matchesDivision
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary">Email Templates</h1>
          <p className="text-text-secondary mt-1">Pre-built templates for all divisions and campaign types</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          {['all', 'marine', 'tech', 'both'].map(div => (
            <button
              key={div}
              onClick={() => setDivisionFilter(div)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                divisionFilter === div
                  ? 'bg-accent-primary/20 text-accent-primary-glow'
                  : 'text-text-secondary hover:bg-bg-surface'
              }`}
            >
              {div === 'all' ? 'All' : div === 'marine' ? 'Marine' : div === 'tech' ? 'Tech' : 'Both'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-bg-elevated rounded w-3/4 mb-3" />
              <div className="h-3 bg-bg-elevated rounded w-full mb-2" />
              <div className="h-3 bg-bg-elevated rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-border-hover transition-all cursor-pointer group"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent-primary" />
                  <h3 className="font-semibold text-text-primary group-hover:text-accent-primary-glow transition-colors">
                    {template.name}
                  </h3>
                </div>
                {template.is_active ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-text-muted" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  template.division === 'marine' ? 'bg-blue-500/20 text-blue-400' :
                  template.division === 'tech' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {template.division === 'marine' ? 'Marine' : template.division === 'tech' ? 'Tech' : 'Both'}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-bg-elevated text-text-muted">
                  {template.type}
                </span>
              </div>

              <p className="text-sm text-text-secondary mb-4 line-clamp-2">{template.subject}</p>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{template.variables.length} variables</span>
                <span>Used {template.usage_count} times</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-clash text-xl font-bold text-text-primary">{selectedTemplate.name}</h2>
              <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-bg-elevated rounded">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedTemplate.division === 'marine' ? 'bg-blue-500/20 text-blue-400' :
                selectedTemplate.division === 'tech' ? 'bg-purple-500/20 text-purple-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {selectedTemplate.division}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-bg-elevated text-text-muted">
                {selectedTemplate.type}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-text-muted mb-1">Subject</label>
              <p className="text-sm text-text-primary font-medium">{selectedTemplate.subject}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-text-muted mb-1">Variables</label>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map(v => (
                  <span key={v} className="text-xs px-2 py-1 bg-accent-primary/20 text-accent-primary-glow rounded">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-text-muted mb-1">Content</label>
              <pre className="text-sm text-text-secondary whitespace-pre-wrap bg-bg-elevated p-4 rounded-lg">
                {selectedTemplate.content}
              </pre>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2">
                <Copy className="w-4 h-4" /> Use Template
              </button>
              <button className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-bg-elevated">
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

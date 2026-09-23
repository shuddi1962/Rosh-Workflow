'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UserRound, Copy, Download, Sparkles, Check } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  division: string
  price_display?: string
  price_naira?: number | null
  description?: string
  features?: string[]
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

const PERSONAS = [
  'Port Harcourt lifestyle creator',
  'Marine / boating enthusiast',
  'Tech reviewer',
  'Business owner testimonial',
  'Comedy skit creator',
]

const DELIVERABLES = ['60s video review', 'Unboxing video', 'Day-in-the-life vlog', '3-slide carousel', '15s story ad']

export default function CreativeInfluencerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [persona, setPersona] = useState(PERSONAS[0])
  const [deliverable, setDeliverable] = useState(DELIVERABLES[0])
  const [handle, setHandle] = useState('')
  const [brief, setBrief] = useState('')
  const [aiEnhancing, setAiEnhancing] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const product = products.find((p) => p.id === productId)

  const buildBrief = () => {
    setError('')
    if (!product) { setError('Select a product first.'); return }
    const price = product.price_display || (product.price_naira ? `₦${Number(product.price_naira).toLocaleString()}` : 'Contact for price')
    const features = (product.features || []).slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n') || '1. Genuine product with warranty\n2. Available in Port Harcourt'
    setBrief(
`INFLUENCER BRIEF — ${product.name}
Platform: ${platform} | Format: ${deliverable}
Creator style: ${persona}${handle ? ` | Handle: ${handle}` : ''}

PRODUCT: ${product.name} by ${product.brand} (${product.category})
PRICE TO MENTION: ${price}

HOOK (first 3 seconds):
"Portharcourt people, see what just landed at Roshanal Infotech!"

TALKING POINTS (say in your own words):
${features}

MUST INCLUDE:
- Show the product clearly on camera
- Mention "Roshanal Infotech, Rumuola Road, Port Harcourt"
- CTA: "DM or WhatsApp 08109522432"

CTA (end card / caption):
"Available now at Roshanal Infotech Limited, No 18A Rumuola/Rumuadaolu Road, Port Harcourt. Call/WhatsApp: 08109522432 | 08033170802"

DO NOT: mention competitors, quote a different price, or promise what isn't listed above.`
    )
  }

  const enhanceWithAI = async () => {
    if (!product) { setError('Select a product first.'); return }
    setAiEnhancing(true); setError('')
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ division: product.division || 'tech', ad_type: `Influencer ${deliverable} brief (${persona})`, product_id: product.id, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI enhance failed')
      const ad = data.ad as Record<string, unknown>
      setBrief((b) => `${b}\n\n--- AI-ENHANCED HOOK & CAPTION ---\n${String(ad.headline || '')}\n\n${String(ad.primary_text || '')}\n\nCTA: ${String(ad.cta_button || '')}`)
    } catch (e) {
      setError(e instanceof Error ? `${e.message} — your manual brief above is still valid.` : 'AI enhance failed')
    } finally {
      setAiEnhancing(false)
    }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(brief); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setError('Copy blocked by browser — select the text manually.') }
  }

  const download = () => {
    const blob = new Blob([brief], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `influencer-brief-${(product?.name || 'product').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <PageHeader
        eyebrow="Creative Studio"
        title="Influencer Brief Generator"
        description="Build a ready-to-send brief for any creator: talking points pulled from your real catalog, CTA with your real contact details."
      />
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border-subtle p-5 space-y-3">
          <div><label className="text-xs text-text-secondary">Product*</label>
            <Select value={productId} onValueChange={setProductId}><SelectTrigger><SelectValue placeholder="Select a product from catalog" /></SelectTrigger><SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.brand}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-text-secondary">Platform</label>
              <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['instagram', 'tiktok', 'facebook', 'youtube', 'whatsapp'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className="text-xs text-text-secondary">Deliverable</label>
              <Select value={deliverable} onValueChange={setDeliverable}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DELIVERABLES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><label className="text-xs text-text-secondary">Creator style</label>
            <Select value={persona} onValueChange={setPersona}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PERSONAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><label className="text-xs text-text-secondary">Creator handle (optional)</label><Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@creator" /></div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={buildBrief} className="bg-accent-primary text-white"><UserRound className="w-4 h-4 mr-2" />Generate brief</Button>
            <Button variant="outline" disabled={aiEnhancing || !brief} onClick={enhanceWithAI}>{aiEnhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Enhance with AI</Button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Brief output</h3>
            {brief && <div className="flex gap-1"><Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}{copied ? 'Copied' : 'Copy'}</Button><Button size="sm" variant="outline" onClick={download}><Download className="w-3 h-3 mr-1" />Download</Button></div>}
          </div>
          <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={20} placeholder="Your generated brief appears here — editable before sending." className="font-mono text-xs" />
        </div>
      </div>
    </div>
  )
}

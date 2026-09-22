'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Send, Copy, Check, Phone, Mail, ExternalLink, TrendingUp } from 'lucide-react'

const SAMPLE_REVIEWS = [
  { name: 'Engr. Tamuno Briggs', source: 'Google', rating: 5, text: 'Genuine Yamaha outboard engine with fast delivery to our jetty in Bonny. Best marine supplier in Port Harcourt.', date: '2 days ago' },
  { name: 'Mrs. Adaeze Okafor', source: 'Google', rating: 5, text: 'They installed 8 Hikvision cameras in our estate duplex at GRA. Very professional team, same-day installation.', date: '1 week ago' },
  { name: 'Capt. Ebiware Johnson', source: 'Facebook', rating: 4, text: 'Good fiberglass repair work on our patrol boat. Will use them again for fleet maintenance.', date: '2 weeks ago' },
]

export default function ReviewsPage() {
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)

  const reviewLink = 'https://g.page/roshanalinfotech/review'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewLink)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = reviewLink
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendRequest = () => {
    if (!phone.trim()) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setPhone('')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reviews & Reputation</h1>
          <p className="text-sm text-slate-500 mt-1">Collect 5-star Google reviews that bring new customers from Port Harcourt.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-2xl font-bold text-slate-900">4.8</span>
          <span className="text-xs text-slate-500">128 reviews</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-[#1468F5]" />
            <h2 className="font-bold text-slate-900">Request a Review</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Send your Google review link to a happy customer after every installation or delivery.</p>
          <div className="flex gap-2 mb-3">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Customer phone e.g. 0803..."
              className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1468F5] focus:ring-2 focus:ring-[#1468F5]/20"
            />
            <button onClick={sendRequest} className="px-4 py-2.5 bg-[#1468F5] text-white rounded-xl text-sm font-medium hover:bg-[#0f4fc4] transition flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Send
            </button>
          </div>
          {sent && <p className="text-xs text-emerald-600 font-medium mb-3">Review request sent via WhatsApp.</p>}
          <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link copied!' : 'Copy review link'}
          </button>
          <div className="flex gap-2 mt-3">
            <a href={`https://wa.me/?text=${encodeURIComponent('Please review Roshanal Infotech: ' + reviewLink)}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition">
              <Phone className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href={`mailto:?subject=Please review us&body=${encodeURIComponent('Please review Roshanal Infotech: ' + reviewLink)}`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition">
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1468F5]" /> Latest Reviews
            </h2>
            <a href={reviewLink} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#1468F5] hover:underline flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                  <span className="text-[11px] text-slate-400">{r.source} • {r.date}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-600">{r.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

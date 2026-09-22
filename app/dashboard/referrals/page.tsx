'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Copy, Check, Users, Wallet, Share2, Trophy, Phone } from 'lucide-react'

const REWARDS = [
  { tier: 'CCTV Referral', reward: '₦25,000 cash', detail: 'For every completed home CCTV installation' },
  { tier: 'Solar Referral', reward: '₦50,000 cash', detail: 'For every completed solar + inverter installation' },
  { tier: 'Marine Referral', reward: '2% commission', detail: 'On every outboard engine or boat sale' },
  { tier: 'Estate Deal', reward: '₦150,000 cash', detail: 'For every estate-wide security contract closed' },
]

const TOP_REFERRERS = [
  { name: 'Pastor F. Amadi', referrals: 14, earned: '₦350,000' },
  { name: 'Alhaji S. Bello', referrals: 9, earned: '₦225,000' },
  { name: 'Engr. K. Opuiyo', referrals: 7, earned: '₦175,000' },
]

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'ROSH-FRIEND-2026'
  const referralLink = `https://roshanalinfotech.com/r/${referralCode}`

  const copyAll = async () => {
    const text = `Get trusted CCTV, solar & marine equipment from Roshanal Infotech, Port Harcourt. Use my link: ${referralLink} — Call/WhatsApp 08109522432`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Referral Program</h1>
          <p className="text-sm text-slate-500 mt-1">Customers earn real cash for every friend they send to Roshanal Infotech.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Users className="w-5 h-5 text-[#1468F5]" />
            <span className="text-xl font-bold text-slate-900">30</span>
            <span className="text-xs text-slate-500">referrals</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <span className="text-xl font-bold text-slate-900">₦750K</span>
            <span className="text-xs text-slate-500">paid out</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gradient-to-br from-[#1468F5] to-[#0f4fc4] rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5" />
            <h2 className="font-bold">Your Referral Link</h2>
          </div>
          <p className="text-sm text-blue-100 mb-4">Share this anywhere — WhatsApp status, church groups, estate forums. You get paid when they buy.</p>
          <div className="bg-white/15 rounded-xl px-3 py-2.5 text-sm font-mono break-all mb-4">{referralLink}</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={copyAll} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#1468F5] rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy invite message'}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent('Get trusted CCTV, solar & marine equipment from Roshanal Infotech PH: ' + referralLink)}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition">
              <Share2 className="w-4 h-4" /> WhatsApp
            </a>
          </div>
          <p className="text-[11px] text-blue-200 mt-4 flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Payouts every Friday via bank transfer — 08109522432
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Reward Tiers</h2>
          <div className="space-y-3">
            {REWARDS.map((r) => (
              <div key={r.tier} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.tier}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.detail}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg whitespace-nowrap">{r.reward}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Top Referrers
          </h2>
          <div className="space-y-3">
            {TOP_REFERRERS.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.referrals} referrals</p>
                </div>
                <span className="text-sm font-bold text-slate-900">{t.earned}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

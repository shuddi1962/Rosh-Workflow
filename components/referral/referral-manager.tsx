'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Users, Gift, Share2, Check, TrendingUp } from 'lucide-react'

interface ReferralStats {
  total_referrals: number
  qualified_referrals: number
  converted_referrals: number
  total_rewards_ngn: number
  pending_rewards_ngn: number
}

interface Referral {
  id: string
  referrer_name: string
  referred_name: string
  referral_code: string
  status: 'pending' | 'qualified' | 'customer' | 'paid'
  reward_ngn: number
  created_at: string
}

interface ReferralManagerProps {
  leadId?: string
}

export default function ReferralManager({ leadId }: ReferralManagerProps) {
  const [referralCode, setReferralCode] = useState('ROSH-2024-XXXX')
  const [copied, setCopied] = useState(false)
  const [stats] = useState<ReferralStats>({
    total_referrals: 24,
    qualified_referrals: 18,
    converted_referrals: 7,
    total_rewards_ngn: 350000,
    pending_rewards_ngn: 100000,
  })
  const [referrals] = useState<Referral[]>([
    { id: '1', referrer_name: 'Emeka Obi', referred_name: 'Chief Okoro', referral_code: 'ROSH-2024-001', status: 'customer', reward_ngn: 50000, created_at: '2024-01-15' },
    { id: '2', referrer_name: 'Grace Ade', referred_name: 'Hotel Trans Amadi', referral_code: 'ROSH-2024-002', status: 'qualified', reward_ngn: 25000, created_at: '2024-01-20' },
    { id: '3', referrer_name: 'Emeka Obi', referred_name: 'NDDC Procurement', referral_code: 'ROSH-2024-003', status: 'pending', reward_ngn: 0, created_at: '2024-02-01' },
  ])

  const copyReferralLink = () => {
    const link = `https://roshanalinfotech.com/ref/${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-clash text-2xl font-bold text-text-primary">Referral Program</h2>
          <p className="text-text-secondary mt-1">Earn rewards for referring new customers</p>
        </div>
        <button className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Share Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-accent-primary" />
            <span className="text-sm text-text-secondary">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.total_referrals}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-text-secondary">Converted</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.converted_referrals}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-text-secondary">Total Rewards</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">₦{stats.total_rewards_ngn.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-text-secondary">Pending</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">₦{stats.pending_rewards_ngn.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-4">Your Referral Link</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 p-3 bg-bg-elevated rounded-lg text-text-primary font-mono text-sm">
            https://roshanalinfotech.com/ref/{referralCode}
          </div>
          <button
            onClick={copyReferralLink}
            className="px-4 py-3 bg-accent-primary/20 text-accent-primary-glow rounded-lg hover:bg-accent-primary/30 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Share this link with friends and family. When they make a purchase, you earn ₦25,000 - ₦50,000 reward.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-4">Referral History</h3>
        <div className="space-y-3">
          {referrals.map(referral => (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary-glow font-semibold">
                    {referral.referred_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{referral.referred_name}</p>
                    <p className="text-xs text-text-muted">Referred by {referral.referrer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    referral.status === 'customer' ? 'bg-emerald-500/20 text-emerald-400' :
                    referral.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                    referral.status === 'paid' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {referral.status}
                  </span>
                  {referral.reward_ngn > 0 && (
                    <p className="text-sm font-medium text-text-primary mt-1">₦{referral.reward_ngn.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

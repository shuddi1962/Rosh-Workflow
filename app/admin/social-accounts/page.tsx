'use client'

import { useState, useEffect } from 'react'

interface SocialAccount {
  id: string
  platform: string
  account_name: string
  account_id: string
  is_connected: boolean
  post_count_today: number
}

const PLATFORMS = ['facebook', 'instagram', 'whatsapp', 'linkedin', 'twitter', 'tiktok']
const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  whatsapp: '💬',
  linkedin: '💼',
  twitter: '🐦',
  tiktok: '🎵',
}

export default function AdminSocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/social/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectAccount = async (platform: string) => {
    setConnecting(platform)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/social/accounts/connect/${platform}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchAccounts()
      }
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setConnecting(null)
    }
  }

  const disconnectAccount = async (id: string) => {
    if (!confirm('Disconnect this account?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/social/accounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setAccounts(accounts.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  if (loading) return <div className="p-6 text-text-secondary">Loading accounts...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">Social Accounts</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-lg border border-border-subtle p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{PLATFORM_ICONS[acc.platform] || '🔗'}</span>
                <div>
                  <h3 className="font-semibold text-text-primary">{acc.platform}</h3>
                  <p className="text-text-muted text-sm">{acc.account_name}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${acc.is_connected ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-bg-surface text-text-muted'}`}>
                {acc.is_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-text-muted text-xs mb-4">Posts today: {acc.post_count_today}</div>
            <button
              onClick={() => acc.is_connected ? disconnectAccount(acc.id) : connectAccount(acc.platform)}
              disabled={connecting === acc.platform}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${acc.is_connected ? 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20' : 'bg-accent-primary text-text-on-accent hover:bg-accent-primary/90'} ${connecting === acc.platform ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {connecting === acc.platform ? 'Connecting...' : acc.is_connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}

        {PLATFORMS.filter(p => !accounts.some(a => a.platform === p)).map(platform => (
          <div key={platform} className="bg-white rounded-lg border border-border-subtle border-dashed p-6 flex flex-col items-center justify-center text-text-muted hover:border-border-default transition-colors">
            <span className="text-3xl mb-3">{PLATFORM_ICONS[platform]}</span>
            <h3 className="font-semibold text-text-secondary capitalize mb-2">{platform}</h3>
            <button
              onClick={() => connectAccount(platform)}
              disabled={connecting === platform}
              className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg text-sm hover:bg-accent-primary/90 disabled:opacity-50 transition-colors"
            >
              {connecting === platform ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Facebook,
  Instagram,
  MessageCircle,
  Linkedin,
  Twitter,
  Loader2,
  Link2,
  Unplug,
  ArrowLeft,
  Zap,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  account_name: string
  is_connected: boolean
  last_post: string | null
  post_count_today: number
}

interface PlatformDef {
  slug: string
  label: string
  description: string
  icon: LucideIcon
  tileClass: string
}

const PLATFORMS: PlatformDef[] = [
  {
    slug: 'facebook',
    label: 'Facebook',
    description: 'Publish to your company Page via the Meta Graph API.',
    icon: Facebook,
    tileClass: 'bg-[#1877F2]/10 text-[#1877F2]',
  },
  {
    slug: 'instagram',
    label: 'Instagram',
    description: 'Publish reels, carousels and stories to your business profile.',
    icon: Instagram,
    tileClass: 'bg-[#E1306C]/10 text-[#E1306C]',
  },
  {
    slug: 'whatsapp',
    label: 'WhatsApp Business',
    description: 'Send broadcasts and status updates via the WhatsApp Cloud API.',
    icon: MessageCircle,
    tileClass: 'bg-[#25D366]/10 text-[#16a34a]',
  },
  {
    slug: 'linkedin',
    label: 'LinkedIn',
    description: 'Share corporate pitches and case studies to your company page.',
    icon: Linkedin,
    tileClass: 'bg-[#0A66C2]/10 text-[#0A66C2]',
  },
  {
    slug: 'twitter',
    label: 'X (Twitter)',
    description: 'Post trend-reactive updates and announcements in real time.',
    icon: Twitter,
    tileClass: 'bg-text-primary/5 text-text-primary',
  },
]

const UNLOCKS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Zap,
    title: 'One-click publishing',
    text: 'Publish any draft or scheduled post straight from the Social hub.',
  },
  {
    icon: CalendarClock,
    title: 'Auto-publish queue',
    text: 'Scheduled posts go out automatically at Nigeria-optimal times.',
  },
  {
    icon: BarChart3,
    title: 'Engagement tracking',
    text: 'Likes, shares and reach roll up into the analytics dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Rate-limit protection',
    text: 'The scheduler spaces posts out so accounts stay in good standing.',
  },
]

export default function SocialAccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/social/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load social accounts')
      const data = await res.json() as { accounts?: SocialAccount[] } | SocialAccount[]
      setAccounts(Array.isArray(data) ? data : (data.accounts ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleConnect = async (platform: string, label: string) => {
    try {
      setBusy(platform)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/social/accounts/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ account_name: `Roshanal ${label}` })
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || `Failed to connect ${label}`)
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setBusy(null)
    }
  }

  const handleDisconnect = async (account: SocialAccount) => {
    if (!confirm(`Disconnect ${account.account_name}? Scheduled auto-publishing for this account will stop.`)) return
    try {
      setBusy(account.platform)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/social/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_connected: false })
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to disconnect account')
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-0">
      <PageHeader
        eyebrow="Social Accounts"
        title="Marketing"
        description="Connect Facebook, Instagram, WhatsApp, LinkedIn and X to enable publishing."
        icon={Link2}
        actions={
          <Button variant="outline" onClick={() => router.push('/dashboard/social')} className="bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Social
          </Button>
        }
      />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red mb-6">
          {error}
          {error.toLowerCase().includes('admin') && (
            <span className="block mt-1 text-text-secondary">
              Only admins can connect accounts — ask an admin or head to Settings.
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon
          const account = accounts.find(a => a.platform.toLowerCase() === platform.slug)
          const connected = account?.is_connected ?? false
          const isBusy = busy === platform.slug
          return (
            <div
              key={platform.slug}
              className="bg-white rounded-xl border border-border-subtle p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${platform.tileClass}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <Badge
                  className={connected
                    ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                    : 'bg-bg-surface text-text-muted border border-border-subtle'}
                >
                  {connected ? 'Connected' : 'Not connected'}
                </Badge>
              </div>
              <h3 className="font-semibold text-text-primary">{platform.label}</h3>
              <p className="text-sm text-text-secondary mt-1 mb-1">{platform.description}</p>
              <p className="text-xs text-text-muted mb-4">
                {account
                  ? `${account.account_name} • ${account.post_count_today} post(s) today`
                  : 'No account registered yet'}
              </p>
              <div className="mt-auto">
                {connected && account ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(account)}
                    disabled={isBusy}
                    className="w-full text-accent-red hover:text-accent-red"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <Unplug className="w-3 h-3 mr-2" />
                    )}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(platform.slug, platform.label)}
                    disabled={isBusy}
                    className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-3 h-3 mr-2" />
                    )}
                    Connect {platform.label}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-1">What connecting unlocks</h3>
        <p className="text-sm text-text-secondary mb-4">
          Each connected account plugs directly into the scheduler, the auto-publish queue and analytics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {UNLOCKS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="bg-bg-surface rounded-lg border border-border-subtle p-4">
                <span className="w-9 h-9 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </span>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-secondary mt-1">{item.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PostEditor } from '@/components/social/post-editor'
import { PostQueue } from '@/components/social/post-queue'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, RefreshCw, Calendar, Share2, Settings2, Send, Clock, Trash2, MessageSquareShare } from 'lucide-react'
import { motion } from 'framer-motion'

interface SocialPost {
  id: string
  division: string
  platform: string
  caption: string
  hashtags: string[]
  cta: string
  status: string
  scheduled_at: string | null
  published_at: string | null
  engagement: Record<string, number>
  created_at: string
}

interface SocialAccount {
  id: string
  platform: string
  account_name: string
  is_connected: boolean
  last_post: string | null
  post_count_today: number
}

export default function SocialPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      const [postsRes, accountsRes] = await Promise.all([
        fetch('/api/social/posts', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/social/accounts', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (postsRes.ok) {
        const postsData = await postsRes.json() as { posts?: SocialPost[] } | SocialPost[]
        setPosts(Array.isArray(postsData) ? postsData : (postsData.posts ?? []))
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json() as { accounts?: SocialAccount[] } | SocialAccount[]
        setAccounts(Array.isArray(accountsData) ? accountsData : (accountsData.accounts ?? []))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSavePost = () => {
    setShowEditor(false)
    setSelectedPost(null)
    fetchData()
  }

  const handleSchedule = async (postId: string) => {
    try {
      setActionId(postId)
      const token = localStorage.getItem('accessToken')
      const date = new Date()
      date.setHours(date.getHours() + 1)
      await fetch(`/api/social/posts/${postId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scheduled_at: date.toISOString() })
      })
      fetchData()
    } catch (err) {
      console.error('Error scheduling:', err)
    } finally {
      setActionId(null)
    }
  }

  const handlePublish = async (postId: string) => {
    try {
      setActionId(postId)
      const token = localStorage.getItem('accessToken')
      await fetch('/api/social/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ post_id: postId })
      })
      fetchData()
    } catch (err) {
      console.error('Error publishing:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      setActionId(postId)
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setActionId(null)
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
        eyebrow="Social Media Automation"
        title="Marketing"
        description="Create, schedule and auto-publish posts across every platform."
        icon={MessageSquareShare}
        actions={
          <>
            <Button onClick={fetchData} variant="outline" className="bg-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setSelectedPost(null)
                setShowEditor(true)
              }}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </>
        }
      />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Connected Platforms</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/dashboard/social/accounts')}
          className="bg-white"
        >
          <Settings2 className="w-3 h-3 mr-2" />
          Manage Accounts
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {['Instagram', 'Facebook', 'WhatsApp', 'LinkedIn', 'Twitter'].map((platform) => {
          const account = accounts.find(a => a.platform.toLowerCase() === platform.toLowerCase())
          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border-subtle p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-text-primary">{platform}</h3>
                <Badge className={account?.is_connected ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-bg-surface text-text-muted border border-border-subtle'}>
                  {account?.is_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <p className="text-text-secondary text-sm mb-3">
                {account ? `${account.post_count_today} posts today` : 'Not configured'}
              </p>
              {!account?.is_connected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/dashboard/social/accounts')}
                  className="w-full"
                >
                  Connect {platform}
                </Button>
              )}
            </motion.div>
          )
        })}
      </div>

      {showEditor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <PostEditor
            onSave={handleSavePost}
            initialData={selectedPost as unknown as Record<string, unknown> || undefined}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-muted" />
            Scheduled Posts
          </h3>
          <PostQueue onSelectPost={(post) => {
            setSelectedPost(post as unknown as SocialPost)
            setShowEditor(true)
          }} />
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-text-muted" />
            Recent Posts
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {posts.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No posts yet — create your first post above.</p>
            ) : (
              posts.slice(0, 10).map((post) => (
                <div key={post.id} className="p-3 bg-bg-surface rounded-lg border border-border-subtle">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-text-primary text-sm font-medium line-clamp-2">{post.caption}</p>
                    <Badge className="ml-2 flex-shrink-0 bg-accent-primary/10 text-accent-primary">{post.platform}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
                    <Badge className="bg-white text-text-secondary border border-border-subtle">{post.status}</Badge>
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    {post.engagement && (
                      <span>
                        {post.engagement.likes || 0} likes • {post.engagement.shares || 0} shares
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.status !== 'published' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSchedule(post.id)}
                          disabled={actionId === post.id}
                        >
                          {actionId === post.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          Schedule +1h
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublish(post.id)}
                          disabled={actionId === post.id}
                          className="bg-accent-emerald hover:bg-accent-emerald/90 text-white"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Publish Now
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(post.id)}
                      disabled={actionId === post.id}
                      className="text-accent-red hover:text-accent-red/80"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

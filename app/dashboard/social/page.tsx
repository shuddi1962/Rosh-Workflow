'use client'

import { useState, useEffect } from 'react'
import { PostEditor } from '@/components/social/post-editor'
import { PostQueue } from '@/components/social/post-queue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, RefreshCw, Calendar, Share2 } from 'lucide-react'
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
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
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
        const postsData = await postsRes.json()
        setPosts(postsData.posts || postsData || [])
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData.accounts || accountsData || [])
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

  const handleSavePost = async (post: Record<string, unknown>) => {
    setShowEditor(false)
    setSelectedPost(null)
    fetchData()
  }

  const handleSchedule = async (postId: string) => {
    try {
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
    }
  }

  const handlePublish = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${postId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      console.error('Error publishing:', err)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      console.error('Error deleting:', err)
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
    <div className="max-w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="font-clash text-3xl font-bold text-text-primary mb-2">Social Media Automation</h1>
            <p className="text-text-secondary">Schedule and publish content across all platforms</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
            >
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
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                <h3 className="font-clash font-semibold text-text-primary">{platform}</h3>
                <Badge variant={account?.is_connected ? 'default' : 'error'}
                  className={account?.is_connected ? 'bg-accent-emerald/10 text-accent-emerald' : ''}>
                  {account?.is_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <p className="text-text-secondary text-sm">
                {account ? `${account.post_count_today} posts today` : 'Not configured'}
              </p>
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
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-muted" />
            Scheduled Posts
          </h3>
          <PostQueue onSelectPost={(post) => {
            setSelectedPost(post as unknown as SocialPost)
            setShowEditor(true)
          }} />
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-text-muted" />
            Recent Posts
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {posts.filter(p => p.status === 'published').length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No published posts yet</p>
            ) : (
              posts.filter(p => p.status === 'published').slice(0, 10).map((post) => (
                <div key={post.id} className="p-3 bg-bg-surface rounded-lg border border-border-ghost">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-text-primary text-sm font-medium line-clamp-2">{post.caption}</p>
                    <Badge variant="info" className="ml-2">{post.platform}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    {post.engagement && (
                      <span>
                        {post.engagement.likes || 0} likes • {post.engagement.shares || 0} shares
                      </span>
                    )}
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

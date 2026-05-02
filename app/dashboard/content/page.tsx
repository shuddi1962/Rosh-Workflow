'use client'

import { useState, useEffect } from 'react'
import { BrainBox } from '@/components/content/brain-box'
import { PostPreview } from '@/components/content/post-preview'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Sparkles, Loader2, RefreshCw, Calendar, Send } from 'lucide-react'
import { motion } from 'framer-motion'

interface ContentPost {
  id: string
  division: string
  post_type: string
  platform: string
  caption: string
  hashtags: string[]
  cta: string
  status: string
  scheduled_at: string | null
  created_at: string
}

export default function ContentBrainPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/content/ideas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch content')
      const data = await res.json()
      setPosts(data.posts || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleSaveDraft = async (caption: string, platform: string, division: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caption,
          platform,
          division,
          status: 'draft'
        })
      })
      fetchPosts()
    } catch (err) {
      console.error('Error saving draft:', err)
    }
  }

  const handleSchedule = async (postId: string, scheduledAt: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${postId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scheduled_at: scheduledAt })
      })
      fetchPosts()
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
      fetchPosts()
    } catch (err) {
      console.error('Error publishing:', err)
    }
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">Content Brain Box</h1>
        <p className="text-gray-600">Generate AI-powered content for your marine and tech divisions</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BrainBox />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-clash text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={fetchPosts}
                variant="outline"
                className="w-full justify-start"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Content
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-clash text-lg font-semibold text-gray-900 mb-4">Content Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-medium text-gray-900">{posts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Drafts</span>
                <span className="font-medium text-yellow-600">
                  {posts.filter(p => p.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-medium text-blue-600">
                  {posts.filter(p => p.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Published</span>
                <span className="font-medium text-green-600">
                  {posts.filter(p => p.status === 'published').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-clash text-xl font-semibold text-gray-900">Generated Content</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No content generated yet. Use the Content Brain above to generate posts.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">
                      AI Generated • {post.division} • {post.post_type}
                    </span>
                  </div>
                  <StatusBadge status={post.status} size="sm" />
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge variant="info">{post.platform}</Badge>
                  {post.hashtags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-gray-500">#{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {post.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          const date = new Date()
                          date.setHours(date.getHours() + 1)
                          handleSchedule(post.id, date.toISOString())
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePublish(post.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Publish
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

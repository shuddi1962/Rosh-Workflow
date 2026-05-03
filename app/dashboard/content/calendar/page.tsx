'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Sparkles, Send, Image as ImageIcon, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'

interface Post {
  id: string
  caption: string
  platform: string
  status: string
  scheduled_at: string
  division: string
  post_type: string
  auto_generated: boolean
  image_url?: string
}

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)
  const [view, setView] = useState<'month' | 'upcoming'>('month')

  useEffect(() => {
    fetchCalendar()
  }, [currentDate])

  const fetchCalendar = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()
      const res = await fetch(`/api/content/calendar?start_date=${start}&end_date=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPosts(data.calendar || [])
    } catch (err) {
      console.error('Failed to fetch calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCalendar()
      setShowPostDetail(false)
    } catch (err) {
      console.error('Error publishing:', err)
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter((p) => p.scheduled_at && p.scheduled_at.startsWith(dateStr))
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    approved: 'bg-purple-100 text-purple-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
      <div className="max-w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Content Calendar</h2>
          <p className="text-sm text-text-muted mt-1">Schedule, manage, and publish your content</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setView(view === 'month' ? 'upcoming' : 'month')}
            variant="outline"
          >
            {view === 'month' ? 'Show Upcoming' : 'Show Month'}
          </Button>
        </div>
      </div>

      {view === 'month' ? (
          <div className="bg-white rounded-xl border border-border-subtle p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent-primary" />
                <h3 className="font-semibold text-text-primary">{monthName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-bg-surface rounded-lg">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm border border-border-default rounded-lg hover:bg-bg-surface text-text-secondary"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-bg-surface rounded-lg">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-bg-overlay rounded-lg overflow-hidden border border-border-subtle">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-text-muted bg-bg-surface py-2">
                {day}
              </div>
            ))}

            {blanks.map((i) => (
              <div key={`blank-${i}`} className="h-28 bg-white" />
            ))}

            {days.map((day) => {
              const dayPosts = getPostsForDay(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`h-28 bg-white p-1 border border-border-ghost ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                   <span className={`text-xs font-medium ${isToday ? 'text-accent-primary font-bold' : 'text-text-muted'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => { setSelectedPost(post); setShowPostDetail(true) }}
                        className={`w-full text-left text-xs truncate px-1 py-0.5 rounded ${
                           statusColors[post.status] || 'bg-bg-elevated text-text-secondary'
                        }`}
                      >
                        {post.platform}
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-text-muted px-1">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-semibold text-text-primary mb-4">Upcoming Posts</h3>
          <div className="space-y-3">
            {posts
              .filter((p) => p.status === 'scheduled' && new Date(p.scheduled_at) > new Date())
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-bg-surface rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  {post.auto_generated && <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{post.caption?.substring(0, 80)}...</p>
                    <p className="text-xs text-text-muted">
                      {post.platform} • {post.division === 'marine' ? 'Marine' : 'Technology'} • {post.post_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <StatusBadge status={post.status} size="sm" />
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {new Date(post.scheduled_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedPost(post); setShowPostDetail(true) }}
                      className="p-1.5 hover:bg-white rounded text-text-muted hover:text-text-secondary"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                    {post.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="p-1.5 hover:bg-accent-emerald/10 rounded text-text-muted hover:text-accent-emerald"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            {posts.filter((p) => p.status === 'scheduled' && new Date(p.scheduled_at) > new Date()).length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-text-muted/50" />
                <p>No upcoming scheduled posts</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPostDetail && selectedPost && (
        <div className="mt-6 bg-white rounded-xl border border-border-subtle p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-primary">Post Details</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={selectedPost.status} size="sm" />
                {selectedPost.auto_generated && (
                  <Badge variant="info" className="text-xs">AI Generated</Badge>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowPostDetail(false)}
              className="p-1 hover:bg-bg-surface rounded text-text-muted"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-text-secondary mb-4">{selectedPost.caption}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-muted">Platform</p>
              <p className="text-sm font-medium text-text-primary">{selectedPost.platform}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Division</p>
              <p className="text-sm font-medium text-text-primary">{selectedPost.division === 'marine' ? 'Marine' : 'Technology'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Scheduled</p>
              <p className="text-sm font-medium text-text-primary">{new Date(selectedPost.scheduled_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Post Type</p>
              <p className="text-sm font-medium text-text-primary">{selectedPost.post_type?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPost.status === 'draft' && (
              <Button
                onClick={() => handlePublish(selectedPost.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

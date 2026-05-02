'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Post {
  id: string
  caption: string
  platform: string
  status: string
  scheduled_at: string
  division: string
}

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">View scheduled and published content</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{monthName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 bg-gray-50 py-2">
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
                className={`h-28 bg-white p-1 border border-gray-100 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className={`text-xs truncate px-1 py-0.5 rounded ${
                        statusColors[post.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.platform}
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-gray-400 px-1">+{dayPosts.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Upcoming Posts</h3>
        <div className="space-y-3">
          {posts
            .filter((p) => p.status === 'scheduled' && new Date(p.scheduled_at) > new Date())
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .slice(0, 10)
            .map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{post.caption?.substring(0, 80)}...</p>
                  <p className="text-xs text-gray-500">
                    {post.platform} • {post.division === 'marine' ? 'Marine' : 'Technology'}
                  </p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(post.scheduled_at).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          {posts.filter((p) => p.status === 'scheduled' && new Date(p.scheduled_at) > new Date()).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No upcoming scheduled posts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

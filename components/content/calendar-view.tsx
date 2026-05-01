"use client"

import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

interface Post {
  id: string
  caption: string
  platform: string
  status: string
  scheduled_at: string
  division: string
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchCalendar = async () => {
      const token = localStorage.getItem("accessToken")
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()
      const res = await fetch(`/api/content/calendar?start_date=${start}&end_date=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPosts(data.calendar || [])
    }
    fetchCalendar()
  }, [currentDate])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return posts.filter((p) => p.scheduled_at && p.scheduled_at.startsWith(dateStr))
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-accent-primary-glow" />
          Content Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-bg-elevated rounded">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-sm font-medium text-text-primary">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-bg-elevated rounded">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-text-muted py-2">
            {day}
          </div>
        ))}

        {blanks.map((i) => (
          <div key={`blank-${i}`} className="h-24 bg-bg-base/50 rounded" />
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
              className={clsx(
                "h-24 bg-bg-base rounded p-1 border",
                isToday ? "border-accent-primary bg-accent-primary/5" : "border-border-subtle"
              )}
            >
              <span className={clsx("text-xs", isToday ? "text-accent-primary-glow font-bold" : "text-text-muted")}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="text-xs truncate text-text-secondary bg-bg-surface px-1 py-0.5 rounded">
                    {post.platform}
                  </div>
                ))}
                {dayPosts.length > 2 && (
                  <div className="text-xs text-text-muted">+{dayPosts.length - 2} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-clash text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          Content Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-gray-50 text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}

        {blanks.map((i) => (
          <div key={`blank-${i}`} className="h-24 bg-white" />
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
                "h-24 bg-white p-1",
                isToday ? "bg-blue-50" : ""
              )}
            >
              <span className={clsx("text-xs", isToday ? "text-blue-600 font-bold" : "text-gray-500")}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="text-xs truncate text-blue-700 bg-blue-100 px-1 py-0.5 rounded">
                    {post.platform}
                  </div>
                ))}
                {dayPosts.length > 2 && (
                  <div className="text-xs text-gray-400">+{dayPosts.length - 2} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

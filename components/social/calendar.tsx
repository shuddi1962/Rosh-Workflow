"use client"

import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id: string
  caption: string
  platform: string
  scheduled_at: string
  status: string
}

export function SocialCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("accessToken")
      const start = new Date(currentWeek)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start)
      end.setDate(end.getDate() + 6)

      const res = await fetch(`/api/content/calendar?start_date=${start.toISOString()}&end_date=${end.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setEvents(data.calendar || [])
    }
    fetchEvents()
  }, [currentWeek])

  const getWeekDays = () => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(day.getDate() + i)
      return day
    })
  }

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((e) => e.scheduled_at.startsWith(dateStr))
  }

  const prevWeek = () => {
    const prev = new Date(currentWeek)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeek(prev)
  }

  const nextWeek = () => {
    const next = new Date(currentWeek)
    next.setDate(next.getDate() + 7)
    setCurrentWeek(next)
  }

  const weekDays = getWeekDays()
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-clash text-lg font-semibold text-text-primary">Weekly Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1 hover:bg-bg-elevated rounded">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-sm font-medium text-text-primary">
            {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
          </span>
          <button onClick={nextWeek} className="p-1 hover:bg-bg-elevated rounded">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString()
          const dayEvents = getEventsForDay(day)

          return (
            <div key={i} className={clsx("rounded-lg border p-2 min-h-[120px]", isToday ? "border-accent-primary bg-accent-primary/5" : "border-border-subtle bg-bg-base")}>
              <div className="text-center mb-2">
                <p className="text-xs text-text-muted">{dayNames[i]}</p>
                <p className={clsx("text-sm font-medium", isToday ? "text-accent-primary-glow" : "text-text-primary")}>
                  {day.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-bg-surface rounded px-1 py-0.5 truncate border-l-2 border-accent-primary"
                    title={event.caption}
                  >
                    {event.platform}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

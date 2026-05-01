"use client"

import { useState, useEffect } from "react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Trash2 } from "lucide-react"

interface PostQueueProps {
  onSelectPost?: (post: Record<string, unknown>) => void
}

export function PostQueue({ onSelectPost }: PostQueueProps) {
  const [queue, setQueue] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQueue = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/social/queue", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setQueue(data.queue || [])
      setLoading(false)
    }
    fetchQueue()
  }, [])

  const handlePublish = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/social/posts/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      setQueue((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error publishing:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/social/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setQueue((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  if (loading) {
    return <div className="text-text-muted text-sm">Loading queue...</div>
  }

  return (
    <div className="space-y-3">
      {queue.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">No posts in queue</p>
        </div>
      ) : (
        queue.map((post) => (
          <div
            key={post.id as string}
            className="bg-bg-surface border border-border-subtle rounded-lg p-4 flex items-start justify-between hover:border-border-hover transition-colors"
          >
            <div className="flex-1 cursor-pointer" onClick={() => onSelectPost?.(post)}>
              <p className="text-sm text-text-primary line-clamp-2">{post.caption as string}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge status="scheduled">{post.platform as string}</Badge>
                {!!post.scheduled_at && (
                  <span className="text-xs text-text-muted">
                    {new Date(post.scheduled_at as string).toLocaleString()}
                  </span>
                )}
                <StatusBadge status={post.status as string} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePublish(post.id as string)}
                className="text-accent-emerald hover:text-accent-emerald/80"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(post.id as string)}
                className="text-accent-red hover:text-accent-red/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

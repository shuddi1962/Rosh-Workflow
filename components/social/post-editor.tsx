"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlatformSelector } from "@/components/content/platform-selector"
import { Sparkles, Save, Loader2 } from "lucide-react"

interface PostEditorProps {
  onSave?: (post: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function PostEditor({ onSave, initialData }: PostEditorProps) {
  const [caption, setCaption] = useState((initialData?.caption as string) || "")
  const [hashtags, setHashtags] = useState<string[]>((initialData?.hashtags as string[]) || [])
  const [cta, setCta] = useState((initialData?.cta as string) || "")
  const [platforms, setPlatforms] = useState<string[]>((initialData?.platform as string) ? [initialData?.platform as string] : ["instagram"])
  const [division, setDivision] = useState((initialData?.division as string) || "marine")
  const [scheduledAt, setScheduledAt] = useState((initialData?.scheduled_at as string) || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const body = {
        caption,
        hashtags,
        cta,
        platform: platforms[0],
        division,
        scheduled_at: scheduledAt || undefined,
        status: scheduledAt ? "scheduled" : "draft",
      }

      const url = initialData?.id ? `/api/social/posts/${initialData.id}` : "/api/social/posts"
      const method = initialData?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (onSave) onSave(data.post)
    } catch (error) {
      console.error("Error saving post:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-4">
      <h3 className="font-clash text-lg font-semibold text-text-primary">Post Editor</h3>

      <div>
        <Label>Division</Label>
        <Select value={division} onValueChange={setDivision}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marine">Marine Division</SelectItem>
            <SelectItem value="tech">Technology Division</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Platforms</Label>
        <PlatformSelector selected={platforms} onChange={setPlatforms} />
      </div>

      <div>
        <Label>Caption</Label>
        <Textarea
          placeholder="Write your post caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <Label>Hashtags (comma separated)</Label>
        <Input
          placeholder="PortHarcourt, RiversState, MarineEquipment"
          value={hashtags.join(", ")}
          onChange={(e) => setHashtags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
        />
      </div>

      <div>
        <Label>Call to Action</Label>
        <Input
          placeholder="Call/WhatsApp us today: 08109522432"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
        />
      </div>

      <div>
        <Label>Schedule (optional)</Label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {initialData?.id ? "Update" : "Save"} Post
        </Button>
      </div>
    </div>
  )
}

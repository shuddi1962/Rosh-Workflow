"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"

interface FeatureToggleCardProps {
  featureKey: string
  label: string
  description?: string
  enabled: boolean
  onToggle?: (key: string, enabled: boolean) => void
}

export function FeatureToggleCard({ featureKey, label, description, enabled, onToggle }: FeatureToggleCardProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/admin/feature-toggles/${featureKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_enabled: !enabled }),
      })
      onToggle?.(featureKey, !enabled)
    } catch (error) {
      console.error("Error toggling feature:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-4 flex items-center justify-between">
      <div className="flex items-start gap-3">
        <Settings className="w-5 h-5 text-text-muted mt-0.5" />
        <div>
          <Label className="text-text-primary font-medium">{label}</Label>
          {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge status={enabled ? "live" : "draft"}>{enabled ? "On" : "Off"}</Badge>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
      </div>
    </div>
  )
}

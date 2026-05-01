"use client"

import { useState, useEffect } from "react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Plus, Trash2, Edit } from "lucide-react"

interface CampaignListProps {
  onSelectCampaign?: (campaign: Record<string, unknown>) => void
  onCreateCampaign?: () => void
}

export function CampaignList({ onSelectCampaign, onCreateCampaign }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting campaign:", error)
    }
  }

  if (loading) return <div className="text-text-muted text-sm">Loading campaigns...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-accent-primary-glow" />
          Campaigns
        </h3>
        <Button onClick={onCreateCampaign} className="bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
          <Megaphone className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">No campaigns yet. Create your first campaign.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id as string}
              className="bg-bg-surface border border-border-subtle rounded-lg p-4 flex items-center justify-between hover:border-border-hover transition-colors"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onSelectCampaign?.(campaign)}>
                <div className="flex items-center gap-2">
                  <h4 className="text-text-primary font-medium">{campaign.name as string}</h4>
                  <StatusBadge status={campaign.status as string} size="sm" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={campaign.division === "marine" ? "scheduled" : "live"}>
                    {campaign.division as string}
                  </Badge>
                  <span className="text-xs text-text-muted capitalize">{campaign.type as string}</span>
                  {!!campaign.scheduled_at && (
                    <span className="text-xs text-text-muted">
                      {new Date(campaign.scheduled_at as string).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => onSelectCampaign?.(campaign)}>
                  <Edit className="w-4 h-4 text-text-muted" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id as string)}>
                  <Trash2 className="w-4 h-4 text-accent-red" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

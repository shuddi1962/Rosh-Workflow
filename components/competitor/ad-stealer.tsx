"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Loader2 } from "lucide-react"

interface Ad {
  id: string
  ad_type: string
  creative_description: string
  copy_angle: string
  cta: string
  estimated_run_days: number
  what_we_can_steal: string
}

export function AdStealer({ ads }: { ads: Ad[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-clash text-lg font-semibold text-text-primary">Steal This Ad</h3>
      <p className="text-sm text-text-muted">Analyze competitor ads and adapt winning strategies for Roshanal</p>

      {ads.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
          <p className="text-text-muted">No competitor ads analyzed yet. Run a competitor scan first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-bg-surface border border-border-subtle rounded-lg p-5 border-l-4 border-l-accent-orange">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge status="draft">{ad.ad_type}</Badge>
                  <Badge status="live" className="ml-2">{ad.copy_angle}</Badge>
                </div>
                <span className="text-xs text-text-muted">{ad.estimated_run_days} days running</span>
              </div>

              <p className="text-sm text-text-primary mb-3">{ad.creative_description}</p>

              <div className="bg-bg-base rounded p-3 mb-3">
                <p className="text-xs text-text-muted mb-1">What we can steal:</p>
                <p className="text-sm text-accent-gold">{ad.what_we_can_steal}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(ad.what_we_can_steal, ad.id)}
                >
                  {copiedId === ad.id ? "Copied!" : <Copy className="w-3 h-3 mr-1" />}
                  {copiedId === ad.id ? "Copied!" : "Copy Idea"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

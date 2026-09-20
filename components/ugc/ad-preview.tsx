import { clsx } from "clsx"
import { Badge } from "@/components/ui/badge"
import { Phone, Play } from "lucide-react"

interface AdPreviewProps {
  headline: string
  primaryText: string
  ctaButton: string
  videoScript: string
  adType: string
  platform: string
}

export function AdPreview({ headline, primaryText, ctaButton, videoScript, adType, platform }: AdPreviewProps) {
  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
      <div className="px-4 py-2 bg-bg-elevated border-b border-border-subtle flex items-center justify-between">
        <Badge status="live">{adType}</Badge>
        <span className="text-xs text-text-muted capitalize">{platform}</span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-lg font-bold text-text-primary">{headline}</h4>
        </div>

        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {primaryText}
        </div>

        {videoScript && (
          <div className="bg-bg-base rounded-lg p-4 border-l-4 border-l-accent-purple">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-accent-purple" />
              <span className="text-sm font-medium text-text-primary">Video Script</span>
            </div>
            <p className="text-sm text-text-muted whitespace-pre-wrap">{videoScript}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-border-subtle">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg text-sm font-medium">
            <Phone className="w-4 h-4" />
            {ctaButton}
          </button>
        </div>
      </div>
    </div>
  )
}

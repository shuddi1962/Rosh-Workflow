import { clsx } from "clsx"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Eye, Target } from "lucide-react"

interface IntelReportProps {
  competitor: string
  report: {
    top_performing_posts?: Array<{ platform: string; content: string; engagement: number }>
    posting_frequency?: Array<{ platform: string; posts_per_week: number }>
    content_gaps?: string[]
    roshanal_weaknesses?: Array<{ weakness: string; recommended_fix: string; priority: string }>
    active_ads?: Array<{ ad_type: string; copy_angle: string; what_we_can_steal: string }>
  }
}

export function IntelReport({ competitor, report }: IntelReportProps) {
  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-clash text-lg font-semibold text-text-primary">{competitor}</h3>
        <Badge status="live">Intel Report</Badge>
      </div>

      {report.active_ads && report.active_ads.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Active Ads
          </h4>
          <div className="space-y-2">
            {report.active_ads.map((ad, i) => (
              <div key={i} className="bg-bg-base rounded p-3 border-l-2 border-accent-orange">
                <p className="text-sm text-text-primary">{ad.ad_type} - {ad.copy_angle}</p>
                <p className="text-xs text-accent-orange mt-1">Steal: {ad.what_we_can_steal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.content_gaps && report.content_gaps.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Content Gaps
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.content_gaps.map((gap, i) => (
              <Badge key={i} status="draft">{gap}</Badge>
            ))}
          </div>
        </div>
      )}

      {report.roshanal_weaknesses && report.roshanal_weaknesses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            Areas to Improve
          </h4>
          <div className="space-y-2">
            {report.roshanal_weaknesses.map((w, i) => (
              <div key={i} className="bg-bg-base rounded p-3">
                <div className="flex items-center gap-2">
                  <Badge status={w.priority === "critical" ? "failed" : w.priority === "high" ? "draft" : "scheduled"}>
                    {w.priority}
                  </Badge>
                  <span className="text-sm text-text-primary">{w.weakness}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Fix: {w.recommended_fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

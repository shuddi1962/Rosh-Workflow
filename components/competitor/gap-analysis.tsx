import { Badge } from "@/components/ui/badge"
import { Target, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react"

interface GapAnalysisProps {
  report: {
    content_gaps: string[]
    audience_gaps: string[]
    offer_gaps: string[]
    roshanal_weaknesses: Array<{ weakness: string; competitor_doing_it: string; recommended_fix: string; priority: string }>
    competitors_scanned: number
  }
}

export function GapAnalysis({ report }: GapAnalysisProps) {
  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-6">
      <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
        <Target className="w-5 h-5 text-accent-primary-glow" />
        Gap Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Content Gaps ({report.content_gaps.length})</h4>
          <div className="space-y-1">
            {report.content_gaps.slice(0, 5).map((gap, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                <ChevronRight className="w-3 h-3 text-accent-primary-glow" />
                {gap}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Audience Gaps ({report.audience_gaps.length})</h4>
          <div className="space-y-1">
            {report.audience_gaps.slice(0, 5).map((gap, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                <ChevronRight className="w-3 h-3 text-accent-emerald" />
                {gap}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Offer Gaps ({report.offer_gaps.length})</h4>
          <div className="space-y-1">
            {report.offer_gaps.slice(0, 5).map((gap, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                <ChevronRight className="w-3 h-3 text-accent-gold" />
                {gap}
              </div>
            ))}
          </div>
        </div>
      </div>

      {report.roshanal_weaknesses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            Weaknesses to Address
          </h4>
          <div className="space-y-2">
            {report.roshanal_weaknesses.map((w, i) => (
              <div key={i} className="bg-bg-base rounded p-3 flex items-start gap-3">
                <Badge status={w.priority === "critical" ? "failed" : w.priority === "high" ? "draft" : "scheduled"}>
                  {w.priority}
                </Badge>
                <div>
                  <p className="text-sm text-text-primary">{w.weakness}</p>
                  <p className="text-xs text-text-muted mt-1">Competitor: {w.competitor_doing_it}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-accent-emerald">
                    <Lightbulb className="w-3 h-3" />
                    Fix: {w.recommended_fix}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted">Scanned {report.competitors_scanned} competitors</p>
    </div>
  )
}

"use client"

import { Shield, Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
  }, [])

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length < 2) return "Overview"
    const page = segments[1]
    return page.charAt(0).toUpperCase() + page.slice(1)
  }

  return (
    <header className="bg-bg-surface border-b border-border-subtle px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Shield className="w-4 h-4 text-accent-primary-glow" />
          <span>Dashboard</span>
          <span className="text-text-muted/50">/</span>
          <span className="text-text-primary font-medium">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated rounded-lg border border-border-subtle">
          <Sparkles className="w-4 h-4 text-accent-primary-glow" />
          <span className="text-xs text-text-secondary">Roshanal AI Platform</span>
        </div>
        <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary-glow font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

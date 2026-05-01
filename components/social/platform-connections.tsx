"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Facebook, Instagram, Linkedin, Twitter, MessageCircle, Video, Globe, Plus } from "lucide-react"

const platformConfig: Record<string, { icon: typeof Facebook; color: string; label: string }> = {
  facebook: { icon: Facebook, color: "text-blue-500", label: "Facebook" },
  instagram: { icon: Instagram, color: "text-pink-500", label: "Instagram" },
  linkedin: { icon: Linkedin, color: "text-blue-700", label: "LinkedIn" },
  twitter: { icon: Twitter, color: "text-gray-400", label: "Twitter/X" },
  whatsapp: { icon: MessageCircle, color: "text-green-500", label: "WhatsApp" },
  tiktok: { icon: Video, color: "text-text-primary", label: "TikTok" },
  youtube: { icon: Video, color: "text-red-500", label: "YouTube" },
  telegram: { icon: Globe, color: "text-blue-400", label: "Telegram" },
}

export function PlatformConnections() {
  const [accounts, setAccounts] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/social/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAccounts(data.accounts || [])
      setLoading(false)
    }
    fetchAccounts()
  }, [])

  const connectedPlatforms = new Set(accounts.map((a) => a.platform))

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Platform Connections</h3>

      {loading ? (
        <div className="text-text-muted text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(platformConfig).map(([id, config]) => {
            const isConnected = connectedPlatforms.has(id)
            const account = accounts.find((a) => a.platform === id)
            const Icon = config.icon

            return (
              <div
                key={id}
                className={`rounded-lg border p-4 text-center ${
                  isConnected
                    ? "border-accent-emerald/30 bg-accent-emerald/5"
                    : "border-border-subtle bg-bg-base"
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${config.color}`} />
                <p className="text-sm font-medium text-text-primary">{config.label}</p>
                {isConnected ? (
                  <Badge status="live" className="mt-2">
                    Connected
                  </Badge>
                ) : (
                  <Button variant="ghost" size="sm" className="mt-2 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                )}
                {account && (
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {account.account_name as string}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

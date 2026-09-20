import { clsx } from "clsx"
import { Badge } from "@/components/ui/badge"
import { Globe, Facebook, Instagram, Search, Loader2 } from "lucide-react"
import { useState } from "react"

interface CompetitorCardProps {
  id: string
  name: string
  website?: string
  facebook_url?: string
  instagram_url?: string
  division: string
  last_scanned?: string
  onScrape?: (id: string) => void
}

export function CompetitorCard({ id, name, website, facebook_url, instagram_url, division, last_scanned, onScrape }: CompetitorCardProps) {
  const [scanning, setScanning] = useState(false)

  const handleScrape = async () => {
    setScanning(true)
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/competitors/${id}/scrape`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      onScrape?.(id)
    } catch (error) {
      console.error("Error scraping:", error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className={clsx(
      "bg-bg-surface rounded-lg border border-border-subtle p-5 hover:border-border-hover transition-all",
      division === "marine" && "hover:border-l-accent-primary",
      division === "tech" && "hover:border-l-accent-purple"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-text-primary font-medium">{name}</h3>
          <Badge status={division === "marine" ? "scheduled" : "live"} className="mt-1">
            {division}
          </Badge>
        </div>
        <button
          onClick={handleScrape}
          disabled={scanning}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent-primary/10 text-accent-primary-glow rounded-lg text-sm font-medium hover:bg-accent-primary/20 transition-colors disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      <div className="flex items-center gap-3 text-text-muted text-xs">
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-primary-glow">
            <Globe className="w-3 h-3" />
            Website
          </a>
        )}
        {facebook_url && (
          <a href={facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-primary-glow">
            <Facebook className="w-3 h-3" />
            Facebook
          </a>
        )}
        {instagram_url && (
          <a href={instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-primary-glow">
            <Instagram className="w-3 h-3" />
            Instagram
          </a>
        )}
      </div>

      {last_scanned && (
        <p className="text-xs text-text-muted mt-3">Last scanned: {new Date(last_scanned).toLocaleDateString()}</p>
      )}
    </div>
  )
}

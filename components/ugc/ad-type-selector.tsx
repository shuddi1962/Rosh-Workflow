"use client"

import { clsx } from "clsx"
import { useState } from "react"
import { Video, Mail, MessageCircle, Search, FileText, Smartphone } from "lucide-react"

const adTypes = [
  { id: "testimonial", label: "Testimonial", icon: Video, category: "Video" },
  { id: "unboxing", label: "Unboxing", icon: Video, category: "Video" },
  { id: "installation", label: "Installation", icon: Video, category: "Video" },
  { id: "problem_solution", label: "Problem-Solution", icon: Video, category: "Video" },
  { id: "facebook_lead", label: "Lead Ad", icon: FileText, category: "Social" },
  { id: "carousel", label: "Carousel", icon: FileText, category: "Social" },
  { id: "story", label: "Story Ad", icon: Smartphone, category: "Social" },
  { id: "whatsapp_broadcast", label: "WhatsApp", icon: MessageCircle, category: "Messaging" },
  { id: "email_blast", label: "Email", icon: Mail, category: "Email" },
  { id: "sms_blast", label: "SMS", icon: Smartphone, category: "Messaging" },
  { id: "google_search", label: "Google Search", icon: Search, category: "Search" },
  { id: "google_display", label: "Google Display", icon: FileText, category: "Search" },
]

const categories = ["All", "Video", "Social", "Messaging", "Email", "Search"]

interface AdTypeSelectorProps {
  selected: string
  onChange: (type: string) => void
}

export function AdTypeSelector({ selected, onChange }: AdTypeSelectorProps) {
  const [category, setCategory] = useState("All")

  const filtered = category === "All" ? adTypes : adTypes.filter((t) => t.category === category)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              category === cat
                ? "bg-accent-primary text-text-on-accent"
                : "bg-bg-surface text-text-secondary border border-border-subtle hover:border-border-hover"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((type) => {
          const isSelected = selected === type.id
          const Icon = type.icon

          return (
            <button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                isSelected
                  ? "border-accent-primary bg-accent-primary/10 text-accent-primary-glow"
                  : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-hover"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{type.label}</span>
              <span className="text-xs text-text-muted">{type.category}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

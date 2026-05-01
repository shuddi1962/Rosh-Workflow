"use client"

import { clsx } from "clsx"
import { useState } from "react"
import { Facebook, Linkedin, Twitter, MessageCircle, Instagram } from "lucide-react"

const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "text-gray-400" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
]

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
  single?: boolean
}

export function PlatformSelector({ selected, onChange, single }: PlatformSelectorProps) {
  const toggle = (id: string) => {
    if (single) {
      onChange([id])
    } else {
      onChange(selected.includes(id) ? selected.filter((p) => p !== id) : [...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const isSelected = selected.includes(platform.id)
        return (
          <button
            key={platform.id}
            onClick={() => toggle(platform.id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
              isSelected
                ? "bg-accent-primary/10 border-accent-primary text-accent-primary-glow"
                : "bg-bg-surface border-border-subtle text-text-secondary hover:border-border-hover"
            )}
          >
            <platform.icon className={clsx("w-4 h-4", platform.color)} />
            {platform.label}
          </button>
        )
      })}
    </div>
  )
}

"use client"

import * as React from "react"
import { clsx } from "clsx"
import { X } from "lucide-react"

interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  onClose: (id: string) => void
}

const variantStyles = {
  default: "border-border-default bg-bg-surface",
  success: "border-status-live/30 bg-bg-surface",
  error: "border-accent-red/30 bg-bg-surface",
  warning: "border-accent-gold/30 bg-bg-surface",
}

export function Toast({ title, description, variant = "default", onClose, id }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg",
        variantStyles[variant]
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

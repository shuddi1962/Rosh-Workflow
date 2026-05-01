"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Sparkles } from "lucide-react"

interface ScriptEditorProps {
  initialScript?: string
  onSave?: (script: string) => void
}

export function ScriptEditor({ initialScript, onSave }: ScriptEditorProps) {
  const [script, setScript] = useState(initialScript || "")

  const handleSave = () => {
    onSave?.(script)
  }

  const sceneMarkers = script.match(/\[Scene \d+\]/g)?.length || 0

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-primary-glow" />
          Script Editor
        </h3>
        {sceneMarkers > 0 && (
          <span className="text-xs text-accent-primary-glow bg-accent-primary/10 px-2 py-1 rounded">
            {sceneMarkers} scenes
          </span>
        )}
      </div>

      <div>
        <Label>Video Script</Label>
        <Textarea
          placeholder="[Scene 1] Opening hook...&#10;&#10;[Scene 2] Problem introduction...&#10;&#10;[Scene 3] Product solution..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Script
        </Button>
      </div>
    </div>
  )
}

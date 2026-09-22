'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Loader2, Download, ImagePlus } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { OPENROUTER_IMAGE_MODELS } from '@/lib/openrouter/models'

type ImageModelId = keyof typeof OPENROUTER_IMAGE_MODELS

interface GeneratedImage {
  url: string
}

function downloadImage(url: string, index: number): void {
  const link = document.createElement('a')
  link.href = url
  link.download = `roshanal-image-${index + 1}.png`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('Professional product photography of Hikvision camera...')
  const [model, setModel] = useState<string>('google/gemini-flash-3.1-image-preview')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])

  async function generate(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/creative/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, aspect_ratio: aspectRatio })
      })
      const data = await res.json() as { images?: GeneratedImage[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      if (data.images) {
        setImages(data.images.map((img) => img.url))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const modelInfo = (OPENROUTER_IMAGE_MODELS as Record<string, (typeof OPENROUTER_IMAGE_MODELS)[ImageModelId] | undefined>)[model]

  return (
    <div>
      <PageHeader
        eyebrow="Creative Studio"
        title="Image Generator"
        description="Generate product shots and marketing visuals with AI."
        icon={ImagePlus}
        actions={
          <Link
            href="/dashboard/creative/library"
            className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-bg-surface"
          >
            Open Library
          </Link>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border-subtle p-6">
          <div className="mb-4">
            <label htmlFor="image-prompt" className="block text-sm text-text-secondary mb-2">Prompt</label>
            <textarea
              id="image-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary h-32 resize-none focus:border-accent-primary outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="image-model" className="block text-sm text-text-secondary mb-2">Model</label>
              <select
                id="image-model"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary text-sm"
              >
                {Object.entries(OPENROUTER_IMAGE_MODELS).map(([id, config]) => (
                  <option key={id} value={id}>{config.label} — {config.approx_cost_per_image}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="image-format" className="block text-sm text-text-secondary mb-2">Format</label>
              <select
                id="image-format"
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary text-sm"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="4:5">4:5 Instagram</option>
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-accent-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-accent-primary/90 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Images'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-semibold text-text-primary mb-4">Model Info</h3>
          {modelInfo && (
            <div className="space-y-3">
              <div>
                <p className="text-text-primary font-medium">{modelInfo.label}</p>
                <p className="text-text-secondary text-sm">{modelInfo.description}</p>
              </div>
              <div className="text-sm text-text-secondary">
                <p><strong>Best for:</strong> {modelInfo.best_for.join(', ')}</p>
                <p><strong>Cost:</strong> {modelInfo.approx_cost_per_image}</p>
                <p><strong>Tier:</strong> {modelInfo.cost_tier}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-1">Strengths:</p>
                <ul className="list-disc pl-4 text-text-secondary text-sm space-y-1">
                  {modelInfo.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-semibold text-text-primary mb-4">Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Generated image ${i + 1}`} className="w-full rounded-lg border border-border-subtle" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => downloadImage(url, i)}
                    className="px-3 py-1.5 bg-accent-primary text-white rounded text-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

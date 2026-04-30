'use client'

import { useState } from 'react'
import { OPENROUTER_IMAGE_MODELS } from '@/lib/openrouter/imageClient'

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('Professional product photography of Hikvision camera...')
  const [model, setModel] = useState<string>('google/gemini-flash-3.1-image-preview')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/creative/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, aspect_ratio: aspectRatio })
      })
      const data = await res.json()
      if (data.images) {
        setImages(data.images.map((img: any) => img.url))
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">🖼️ Image Studio</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-surface rounded-lg border border-border-subtle p-6">
          <div className="mb-4">
            <label className="block text-text-secondary mb-2">Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary h-32 resize-none focus:border-accent-primary outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-text-secondary mb-2">Model</label>
              <select 
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary"
              >
                {Object.entries(OPENROUTER_IMAGE_MODELS).map(([id, config]: [string, any]) => (
                  <option key={id} value={id}>{config.label} — {config.approx_cost_per_image}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-secondary mb-2">Format</label>
              <select 
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary"
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
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '✦ Generating...' : '✦ Generate Images'}
          </button>
        </div>
        
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Model Info</h3>
          {model && OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS] && (
            <div className="space-y-3">
              <div>
                <p className="text-text-primary font-medium">{OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].label}</p>
                <p className="text-text-muted text-sm">{OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].description}</p>
              </div>
              <div className="text-sm text-text-secondary">
                <p><strong>Best for:</strong> {(OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].best_for as string[]).join(', ')}</p>
                <p><strong>Cost:</strong> {OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].approx_cost_per_image}</p>
                <p><strong>Tier:</strong> {OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].cost_tier}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-1">Strengths:</p>
                <ul className="list-disc pl-4 text-text-muted text-sm space-y-1">
                  {(OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS].strengths as string[]).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {images.length > 0 && (
        <div className="mt-8 bg-bg-surface rounded-lg border border-border-subtle p-6">
          <h3 className="font-clash font-semibold text-text-primary mb-4">Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="Generated" className="w-full rounded-lg border border-border-default" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                  <button className="px-3 py-1 bg-accent-primary text-text-on-accent rounded text-sm">Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

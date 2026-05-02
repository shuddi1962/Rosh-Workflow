'use client'

import { useState } from 'react'
import { Play, Loader2, Sparkles, Film, Music, Image } from 'lucide-react'

const VIDEO_TYPES = [
  { id: 'reel_15s', label: 'Instagram/TikTok Reel (15s)', ratio: '9:16', duration: 15 },
  { id: 'reel_30s', label: 'Instagram Reel / TikTok (30s)', ratio: '9:16', duration: 30 },
  { id: 'youtube_short', label: 'YouTube Short (60s)', ratio: '9:16', duration: 60 },
  { id: 'facebook_ad', label: 'Facebook Video Ad (45s)', ratio: '16:9', duration: 45 },
  { id: 'product_video', label: 'Product Showcase (90s)', ratio: '16:9', duration: 90 },
  { id: 'explainer', label: 'Explainer Video (120s)', ratio: '16:9', duration: 120 },
  { id: 'brand_film', label: 'Brand Film (180s)', ratio: '16:9', duration: 180 },
]

const SCENES = [
  { id: 1, duration: 8, label: 'HOOK: Family frustrated in darkness (PHCN off)', status: 'ready' },
  { id: 2, duration: 8, label: 'PROBLEM: Generator runs out, costs rising', status: 'ready' },
  { id: 3, duration: 8, label: 'SOLUTION: Roshanal solar team arrives', status: 'generating' },
  { id: 4, duration: 8, label: 'INSTALLATION: Professional solar panel install', status: 'queued' },
  { id: 5, duration: 8, label: 'RESULT: Family lights, TV, appliances — happy', status: 'queued' },
  { id: 6, duration: 8, label: 'PRODUCT CLOSE: LivFast battery, clean display', status: 'queued' },
  { id: 7, duration: 5, label: 'CTA: Call 08109522432 + WhatsApp', status: 'queued' },
]

export default function VideoStudioPage() {
  const [selectedType, setSelectedType] = useState('product_video')
  const [selectedDivision, setSelectedDivision] = useState('tech')
  const [generating, setGenerating] = useState(false)

  const selected = VIDEO_TYPES.find(t => t.id === selectedType)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash text-3xl font-bold text-text-primary">Video Creation Studio</h1>
        <p className="text-text-secondary mt-1">Create multi-scene, cinematic videos for marketing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Video Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Division</label>
                <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary">
                  <option value="tech">Technology</option>
                  <option value="marine">Marine</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Video Type</label>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary">
                  {VIDEO_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">AI Model</label>
                <select className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary">
                  <option>Kling 3.0 (Multi-shot)</option>
                  <option>Veo 3 (Highest Quality)</option>
                  <option>Veo 3 Fast (Reels)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <Film className="w-5 h-5 text-accent-purple" /> Story Builder
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated text-text-primary">+ Add Scene</button>
                <button className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated text-text-primary flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> AI Rewrite
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {SCENES.map((scene, i) => (
                <div key={scene.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  scene.status === 'ready' ? 'border-accent-emerald/30 bg-accent-emerald/10' :
                  scene.status === 'generating' ? 'border-accent-gold/30 bg-accent-gold/10' :
                  'border-border-subtle bg-bg-surface'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold text-text-secondary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      [{scene.duration}s] {scene.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {scene.status === 'ready' && <span className="text-xs text-accent-emerald font-medium"> Ready</span>}
                    {scene.status === 'generating' && (
                      <span className="text-xs text-accent-gold font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating
                      </span>
                    )}
                    {scene.status === 'queued' && <span className="text-xs text-text-muted">Queued</span>}
                    {scene.status === 'ready' && (
                      <button className="p-1 hover:bg-accent-emerald/20 rounded">
                        <Play className="w-4 h-4 text-accent-emerald" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Preview</h3>
            <div className="aspect-video bg-bg-elevated rounded-lg flex items-center justify-center">
              <div className="text-center text-text-muted">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Video preview</p>
                <p className="text-xs mt-1">{selected?.ratio} · {selected?.duration}s</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Audio</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input type="radio" name="audio" defaultChecked className="accent-accent-primary" />
                <span>AI Voiceover</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input type="radio" name="audio" className="accent-accent-primary" />
                <span>Background Music</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input type="radio" name="audio" className="accent-accent-primary" />
                <span>No Audio</span>
              </label>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Scenes</span>
                <span className="text-text-primary">{SCENES.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Duration</span>
                <span className="text-text-primary">{selected?.duration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Est. Cost</span>
                <span className="font-bold text-text-primary">~$0.80</span>
              </div>
            </div>
            <button
              onClick={() => setGenerating(true)}
              disabled={generating}
              className="w-full mt-4 px-4 py-2.5 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate All Scenes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

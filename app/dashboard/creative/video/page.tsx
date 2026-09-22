'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Loader2, Sparkles, Film, Pause } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

const VIDEO_TYPES = [
  { id: 'reel_15s', label: 'Instagram/TikTok Reel (15s)', ratio: '9:16', duration: 15 },
  { id: 'reel_30s', label: 'Instagram Reel / TikTok (30s)', ratio: '9:16', duration: 30 },
  { id: 'youtube_short', label: 'YouTube Short (60s)', ratio: '9:16', duration: 60 },
  { id: 'facebook_ad', label: 'Facebook Video Ad (45s)', ratio: '16:9', duration: 45 },
  { id: 'product_video', label: 'Product Showcase (90s)', ratio: '16:9', duration: 90 },
  { id: 'explainer', label: 'Explainer Video (120s)', ratio: '16:9', duration: 120 },
  { id: 'brand_film', label: 'Brand Film (180s)', ratio: '16:9', duration: 180 },
]

type SceneStatus = 'ready' | 'generating' | 'queued'

interface Scene {
  id: number
  duration: number
  label: string
  status: SceneStatus
}

const INITIAL_SCENES: Scene[] = [
  { id: 1, duration: 8, label: 'HOOK: Family frustrated in darkness (PHCN off)', status: 'ready' },
  { id: 2, duration: 8, label: 'PROBLEM: Generator runs out, costs rising', status: 'ready' },
  { id: 3, duration: 8, label: 'SOLUTION: Roshanal solar team arrives', status: 'queued' },
  { id: 4, duration: 8, label: 'INSTALLATION: Professional solar panel install', status: 'queued' },
  { id: 5, duration: 8, label: 'RESULT: Family lights, TV, appliances — happy', status: 'queued' },
  { id: 6, duration: 8, label: 'PRODUCT CLOSE: LivFast battery, clean display', status: 'queued' },
  { id: 7, duration: 5, label: 'CTA: Call 08109522432 + WhatsApp', status: 'queued' },
]

const AI_MODELS = [
  { id: 'veo3', label: 'Veo 3 (Highest Quality)' },
  { id: 'veo3-fast', label: 'Veo 3 Fast (Reels)' },
  { id: 'kling', label: 'Kling 3.0 (Multi-shot)' },
]

export default function VideoStudioPage() {
  const [selectedType, setSelectedType] = useState('product_video')
  const [selectedDivision, setSelectedDivision] = useState('tech')
  const [aiModel, setAiModel] = useState('veo3-fast')
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [playingScene, setPlayingScene] = useState<number | null>(null)
  const [previewScene, setPreviewScene] = useState<Scene | null>(null)

  const selected = VIDEO_TYPES.find(t => t.id === selectedType)

  const handleAddScene = (): void => {
    const nextId = scenes.length > 0 ? Math.max(...scenes.map(s => s.id)) + 1 : 1
    setScenes(prev => [...prev, { id: nextId, duration: 8, label: 'NEW SCENE: describe this shot...', status: 'queued' }])
  }

  const handleAiRewrite = (): void => {
    setScenes(prev =>
      prev.map(s =>
        s.status === 'queued'
          ? { ...s, status: 'ready' as SceneStatus }
          : s
      )
    )
  }

  const handlePreviewScene = (scene: Scene): void => {
    if (playingScene === scene.id) {
      setPlayingScene(null)
      setPreviewScene(null)
    } else {
      setPlayingScene(scene.id)
      setPreviewScene(scene)
    }
  }

  const handleGenerateAll = async (): Promise<void> => {
    setGenerating(true)
    setError('')
    setTaskId(null)
    setScenes(prev => prev.map(s => (s.status === 'queued' ? { ...s, status: 'generating' as SceneStatus } : s)))
    try {
      const prompt = scenes.map((s, i) => `Scene ${i + 1} [${s.duration}s]: ${s.label}`).join('\n')
      const res = await fetch('/api/creative/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: aiModel,
          aspect_ratio: selected?.ratio ?? '9:16',
        }),
      })
      const data = await res.json() as { taskId?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Video generation failed')
      if (data.taskId) setTaskId(data.taskId)
      setScenes(prev => prev.map(s => (s.status === 'generating' ? { ...s, status: 'ready' as SceneStatus } : s)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setScenes(prev => prev.map(s => (s.status === 'generating' ? { ...s, status: 'queued' as SceneStatus } : s)))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Creative Studio"
        title="Video Studio"
        description="Turn products into multi-scene marketing videos."
        icon={Film}
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
      {taskId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-sm mb-6">
          Video job started — task ID: <span className="font-mono">{taskId}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Video Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="video-division" className="block text-sm text-text-secondary mb-1">Division</label>
                <select id="video-division" value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary">
                  <option value="tech">Technology</option>
                  <option value="marine">Marine</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label htmlFor="video-type" className="block text-sm text-text-secondary mb-1">Video Type</label>
                <select id="video-type" value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary">
                  {VIDEO_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="video-model" className="block text-sm text-text-secondary mb-1">AI Model</label>
                <select id="video-model" value={aiModel} onChange={e => setAiModel(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-white text-text-primary">
                  {AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <Film className="w-5 h-5 text-accent-primary" /> Story Builder
              </h2>
              <div className="flex gap-2">
                <button onClick={handleAddScene} className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm hover:bg-bg-surface text-text-primary">+ Add Scene</button>
                <button onClick={handleAiRewrite} className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm hover:bg-bg-surface text-text-primary flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Mark Queued Ready
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {scenes.map((scene, i) => (
                <div key={scene.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  scene.status === 'ready' ? 'border-emerald-200 bg-emerald-50' :
                  scene.status === 'generating' ? 'border-amber-200 bg-amber-50' :
                  'border-border-subtle bg-white'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-sm font-bold text-text-secondary flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      [{scene.duration}s] {scene.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {scene.status === 'ready' && <span className="text-xs text-emerald-600 font-medium">Ready</span>}
                    {scene.status === 'generating' && (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating
                      </span>
                    )}
                    {scene.status === 'queued' && <span className="text-xs text-text-muted">Queued</span>}
                    {scene.status === 'ready' && (
                      <button onClick={() => handlePreviewScene(scene)} className="p-1 hover:bg-emerald-100 rounded" aria-label={playingScene === scene.id ? 'Stop preview' : 'Preview scene'}>
                        {playingScene === scene.id ? (
                          <Pause className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Play className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Preview</h3>
            <div className="aspect-video bg-bg-surface rounded-lg flex items-center justify-center">
              <div className="text-center text-text-muted px-4">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                {previewScene ? (
                  <>
                    <p className="text-sm text-text-primary font-medium">Scene preview</p>
                    <p className="text-xs mt-1 text-text-secondary">{previewScene.label}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">Video preview</p>
                    <p className="text-xs mt-1">{selected?.ratio} · {selected?.duration}s</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Scenes</span>
                <span className="text-text-primary">{scenes.length}</span>
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
              onClick={handleGenerateAll}
              disabled={generating}
              className="w-full mt-4 px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Generating...' : 'Generate All Scenes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

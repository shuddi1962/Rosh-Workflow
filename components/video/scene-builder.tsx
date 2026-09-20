'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, GripVertical, Image, Video, Type, Music, Clock, ArrowRight, Eye } from 'lucide-react'

interface VideoScene {
  id: string
  type: 'image' | 'video' | 'text' | 'transition'
  duration: number
  content: string
  overlay_text?: string
  overlay_position?: 'top' | 'center' | 'bottom'
  music?: string
  transition?: 'fade' | 'slide' | 'zoom' | 'cut'
  order: number
}

interface SceneBuilderProps {
  scenes: VideoScene[]
  onChange: (scenes: VideoScene[]) => void
}

const SCENE_TYPES = [
  { id: 'image', label: 'Image', icon: Image, color: 'text-blue-400' },
  { id: 'video', label: 'Video Clip', icon: Video, color: 'text-purple-400' },
  { id: 'text', label: 'Text Card', icon: Type, color: 'text-emerald-400' },
  { id: 'transition', label: 'Transition', icon: ArrowRight, color: 'text-amber-400' },
]

const TRANSITIONS = [
  { id: 'fade', label: 'Fade' },
  { id: 'slide', label: 'Slide' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'cut', label: 'Cut' },
]

const TEXT_POSITIONS = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
]

export function SceneBuilder({ scenes, onChange }: SceneBuilderProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null)

  const addScene = (type: VideoScene['type']) => {
    const newScene: VideoScene = {
      id: crypto.randomUUID(),
      type,
      duration: type === 'text' ? 3 : type === 'transition' ? 1 : 5,
      content: '',
      overlay_text: '',
      overlay_position: 'center',
      transition: 'fade',
      order: scenes.length + 1,
    }
    onChange([...scenes, newScene])
  }

  const removeScene = (id: string) => {
    if (scenes.length <= 1) return
    const newScenes = scenes.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }))
    onChange(newScenes)
  }

  const updateScene = (id: string, updates: Partial<VideoScene>) => {
    onChange(scenes.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === scenes.length - 1) return
    const newScenes = [...scenes]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newScenes[index], newScenes[swapIndex]] = [newScenes[swapIndex], newScenes[index]]
    onChange(newScenes.map((s, i) => ({ ...s, order: i + 1 })))
  }

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {SCENE_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => addScene(type.id as VideoScene['type'])}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated transition-colors flex items-center gap-2"
          >
            <type.icon className={`w-4 h-4 ${type.color}`} />
            Add {type.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 p-3 bg-bg-elevated rounded-lg">
        <span className="text-sm text-text-secondary">Total scenes: <span className="font-bold text-text-primary">{scenes.length}</span></span>
        <span className="text-sm text-text-secondary">Total duration: <span className="font-bold text-text-primary">{totalDuration}s</span></span>
        <span className="text-xs text-text-muted">
          {totalDuration <= 15 ? 'Instagram Story' : totalDuration <= 30 ? 'Instagram Reel' : 'Full Video'}
        </span>
      </div>

      <div className="space-y-3">
        {scenes.map((scene, index) => {
          const sceneType = SCENE_TYPES.find(t => t.id === scene.type)
          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${
                selectedScene === scene.id ? 'border-accent-primary' : 'border-border-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary-glow flex items-center justify-center text-xs font-bold">
                    {scene.order}
                  </span>
                  {sceneType && <sceneType.icon className={`w-4 h-4 ${sceneType.color}`} />}
                  <span className="text-sm font-medium text-text-primary">{sceneType?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveScene(index, 'up')} disabled={index === 0} className="p-1 hover:bg-bg-elevated rounded disabled:opacity-30">
                    ↑
                  </button>
                  <button onClick={() => moveScene(index, 'down')} disabled={index === scenes.length - 1} className="p-1 hover:bg-bg-elevated rounded disabled:opacity-30">
                    ↓
                  </button>
                  {scenes.length > 1 && (
                    <button onClick={() => removeScene(scene.id)} className="p-1 hover:bg-accent-red/10 rounded text-accent-red">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Duration (seconds)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={scene.duration}
                      onChange={e => updateScene(scene.id, { duration: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-text-primary w-8">{scene.duration}s</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Transition</label>
                  <select
                    value={scene.transition || 'fade'}
                    onChange={e => updateScene(scene.id, { transition: e.target.value as VideoScene['transition'] })}
                    className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                  >
                    {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {(scene.type === 'image' || scene.type === 'video') && (
                <div className="mb-3">
                  <label className="block text-xs text-text-muted mb-1">
                    {scene.type === 'image' ? 'Image URL' : 'Video URL'}
                  </label>
                  <input
                    value={scene.content}
                    onChange={e => updateScene(scene.id, { content: e.target.value })}
                    placeholder={scene.type === 'image' ? 'https://...' : 'https://...'}
                    className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                  />
                </div>
              )}

              {scene.type === 'text' && (
                <div className="mb-3">
                  <label className="block text-xs text-text-muted mb-1">Text Content</label>
                  <textarea
                    value={scene.content}
                    onChange={e => updateScene(scene.id, { content: e.target.value })}
                    placeholder="Enter text for this card..."
                    rows={2}
                    className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm resize-none text-text-primary"
                  />
                </div>
              )}

              {(scene.type === 'image' || scene.type === 'video') && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Overlay Text (optional)</label>
                    <input
                      value={scene.overlay_text || ''}
                      onChange={e => updateScene(scene.id, { overlay_text: e.target.value })}
                      placeholder="Text on screen..."
                      className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Text Position</label>
                    <select
                      value={scene.overlay_position || 'center'}
                      onChange={e => updateScene(scene.id, { overlay_position: e.target.value as VideoScene['overlay_position'] })}
                      className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                    >
                      {TEXT_POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-text-muted" />
                <input
                  value={scene.music || ''}
                  onChange={e => updateScene(scene.id, { music: e.target.value })}
                  placeholder="Background music URL (optional)"
                  className="flex-1 p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                />
              </div>

              {index < scenes.length - 1 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                  <span className="text-xs text-text-muted">
                    {scene.transition} → Scene {scenes[index + 1].order} ({SCENE_TYPES.find(t => t.id === scenes[index + 1].type)?.label})
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {scenes.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-xl">
          <Video className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No scenes added</h3>
          <p className="text-text-secondary mb-4">Add your first scene to start building your video.</p>
          <button
            onClick={() => addScene('image')}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90"
          >
            Add First Scene
          </button>
        </div>
      )}
    </div>
  )
}

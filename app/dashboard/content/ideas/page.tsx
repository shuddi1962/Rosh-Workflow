'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { 
  Sparkles, Loader2, RefreshCw, Calendar, Send, Trash2, Eye, 
  Image as ImageIcon, Video, CheckSquare, Square, Zap, Settings,
  Clock, TrendingUp, Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentIdea {
  id: string
  division: string
  post_type: string
  platform: string
  caption: string
  hashtags: string[]
  cta: string
  status: string
  scheduled_at: string | null
  published_at: string | null
  auto_generated: boolean
  urgency: string
  image_prompt?: string
  image_url?: string
  created_at: string
}

export default function ContentIdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [divisionFilter, setDivisionFilter] = useState('all')
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [generatingDaily, setGeneratingDaily] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [generatingImage, setGeneratingImage] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/content/ideas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch content ideas')
      const data = await res.json()
      setIdeas(data.ideas || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchIdeas, 300000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const handleDailyGeneration = async () => {
    setGeneratingDaily(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/content/daily-ideas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        fetchIdeas()
      }
    } catch (err) {
      console.error('Error generating daily ideas:', err)
    } finally {
      setGeneratingDaily(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/content/ideas/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchIdeas()
    } catch (err) {
      console.error('Error approving:', err)
    }
  }

  const handleSchedule = async (id: string) => {
    if (!scheduleDate) return
    setScheduling(true)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scheduled_at: scheduleDate })
      })
      setScheduleDate('')
      setShowDetail(false)
      fetchIdeas()
    } catch (err) {
      console.error('Error scheduling:', err)
    } finally {
      setScheduling(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchIdeas()
    } catch (err) {
      console.error('Error publishing:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content idea?')) return
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/social/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (selectedIdea?.id === id) {
        setSelectedIdea(null)
        setShowDetail(false)
      }
      fetchIdeas()
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt) return
    setGeneratingImage(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: imagePrompt })
      })
      const data = await res.json()
      if (data.image_url) setGeneratedImage(data.image_url)
    } catch (err) {
      console.error('Error generating image:', err)
    } finally {
      setGeneratingImage(false)
    }
  }

  const handleBatchCreatePosts = async () => {
    if (selectedIdeas.length === 0) return
    setShowCreateModal(true)
  }

  const toggleSelect = (id: string) => {
    setSelectedIdeas(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredIdeas = ideas.filter(idea => {
    if (filter !== 'all' && idea.status !== filter) return false
    if (divisionFilter !== 'all' && idea.division !== divisionFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Ideas</h2>
          <p className="text-sm text-gray-500 mt-1">AI-generated ideas with one-click post creation</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            className={autoRefresh ? 'bg-blue-600 text-white' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={handleDailyGeneration}
            disabled={generatingDaily}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {generatingDaily ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Generate Daily Ideas
          </Button>
          <Button
            onClick={fetchIdeas}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          Error: {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
        >
          <option value="all">All Divisions</option>
          <option value="marine">Marine</option>
          <option value="tech">Technology</option>
        </select>
        <select
          value=""
          onChange={(e) => {}}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
        >
          <option value="">All Urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIdeas(selectedIdeas.length === filteredIdeas.length ? [] : filteredIdeas.map(i => i.id))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {selectedIdeas.length === filteredIdeas.length ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-600">
                {selectedIdeas.length} selected
              </span>
              {selectedIdeas.length > 0 && (
                <Button
                  onClick={handleBatchCreatePosts}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Posts from Selected
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowImageModal(true)}
                variant="outline"
                size="sm"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No content ideas yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Generate Daily Ideas" to create AI-powered content</p>
              </div>
            ) : (
              filteredIdeas.map((idea) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleSelect(idea.id)}
                      className="mt-1 p-1 hover:bg-gray-100 rounded"
                    >
                      {selectedIdeas.includes(idea.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {idea.auto_generated && <Sparkles className="w-4 h-4 text-purple-600" />}
                          <span className="text-xs font-medium text-purple-600">
                            {idea.division === 'marine' ? 'Marine' : 'Technology'} • {idea.post_type?.replace(/_/g, ' ')}
                          </span>
                          {idea.urgency === 'high' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">High Priority</Badge>
                          )}
                        </div>
                        <StatusBadge status={idea.status} size="sm" />
                      </div>

                      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{idea.caption}</p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="info" className="text-xs">{idea.platform}</Badge>
                        {idea.hashtags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                            <Hash className="w-3 h-3" />#{tag}
                          </span>
                        ))}
                      </div>

                      {idea.image_url && (
                        <div className="mb-3">
                          <img 
                            src={idea.image_url} 
                            alt="Generated" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {new Date(idea.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setSelectedIdea(idea); setShowDetail(true) }}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setImagePrompt(idea.image_prompt || ''); setShowImageModal(true) }}
                            className="p-1.5 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log('Generate video script for', idea.id)}
                            className="p-1.5 hover:bg-purple-50 rounded text-gray-500 hover:text-purple-600"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                          {idea.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleApprove(idea.id)}
                                className="p-1.5 hover:bg-green-50 rounded text-gray-500 hover:text-green-600"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setSelectedIdea(idea); setShowDetail(true); setScheduleDate('') }}
                                className="p-1.5 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePublish(idea.id)}
                                className="p-1.5 hover:bg-green-50 rounded text-gray-500 hover:text-green-600"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Ideas</span>
                <span className="font-medium text-gray-900">{ideas.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Drafts</span>
                <span className="font-medium text-amber-600">
                  {ideas.filter(p => p.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-medium text-blue-600">
                  {ideas.filter(p => p.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Published</span>
                <span className="font-medium text-green-600">
                  {ideas.filter(p => p.status === 'published').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auto-Generated</span>
                <span className="font-medium text-purple-600">
                  {ideas.filter(p => p.auto_generated).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">High Priority</span>
                <span className="font-medium text-red-600">
                  {ideas.filter(p => p.urgency === 'high').length}
                </span>
              </div>
            </div>
          </div>

          {showDetail && selectedIdea && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Schedule Post</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{selectedIdea.caption}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <Button
                  onClick={() => handleSchedule(selectedIdea.id)}
                  disabled={scheduling || !scheduleDate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {scheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Schedule
                </Button>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Daily Automation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ideas are auto-generated daily at 6am WAT. Toggle auto-refresh to see new ideas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Live trend monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI-powered content</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Nigeria-optimal scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Generate AI Image</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Image Prompt</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  rows={3}
                  placeholder="Describe the image you want to generate..."
                />
              </div>
              <Button
                onClick={handleGenerateImage}
                disabled={generatingImage || !imagePrompt}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generatingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                Generate Image
              </Button>
              {generatedImage && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">Generated Image:</p>
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full rounded-lg border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Right-click to save or copy URL
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

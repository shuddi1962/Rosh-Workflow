'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PostPreview } from '@/components/content/post-preview'
import { Sparkles, Loader2 } from 'lucide-react'

export function BrainBox() {
  const [division, setDivision] = useState('marine')
  const [postType, setPostType] = useState('product_spotlight')
  const [platform, setPlatform] = useState('instagram')
  const [productId, setProductId] = useState('')
  const [trendId, setTrendId] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedPost, setGeneratedPost] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          division,
          post_type: postType,
          platform,
          product_id: productId || undefined,
          trend_id: trendId || undefined,
          custom_prompt: customPrompt || undefined,
        }),
      })
      const data = await response.json()
      if (data.post) {
        setGeneratedPost(data.post)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        Generate Content
      </h2>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-700">Division</Label>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marine">Marine Division</SelectItem>
              <SelectItem value="tech">Technology Division</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-gray-700">Post Type</Label>
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product_spotlight">Product Spotlight</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="trend_reactive">Trend Reactive</SelectItem>
              <SelectItem value="problem_solution">Problem-Solution</SelectItem>
              <SelectItem value="testimonial">Testimonial</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="how_to">How-To</SelectItem>
              <SelectItem value="price_post">Price Post</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="urgency">Urgency/Last Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-gray-700">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-gray-700">Product ID (optional)</Label>
          <Input
            placeholder="Enter product ID or leave empty"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-gray-700">Trend ID (optional)</Label>
          <Input
            placeholder="Enter trend ID or leave empty"
            value={trendId}
            onChange={(e) => setTrendId(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-gray-700">Custom Instructions (optional)</Label>
          <Textarea
            placeholder="Add any specific instructions for the AI..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {generatedPost && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <PostPreview
            caption={(generatedPost.caption as string) || ''}
            hashtags={(generatedPost.hashtags as string[]) || []}
            cta={(generatedPost.cta as string) || ''}
            platform={(generatedPost.platform as string) || ''}
            division={(generatedPost.division as string) || ''}
          />
        </div>
      )}
    </div>
  )
}

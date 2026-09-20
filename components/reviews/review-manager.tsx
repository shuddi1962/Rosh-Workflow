'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, MessageSquare, Video, Share2, Check, Clock } from 'lucide-react'

interface Review {
  id: string
  customer_name: string
  product: string
  platform: 'google' | 'facebook' | 'whatsapp' | 'video'
  rating: number
  review_text: string
  submitted_at: string
  published_to_social: boolean
}

interface ReviewManagerProps {
  productId?: string
}

export default function ReviewManager({ productId }: ReviewManagerProps) {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [reviews] = useState<Review[]>([
    { id: '1', customer_name: 'Emeka Obi', product: 'Suzuki 100HP Outboard', platform: 'google', rating: 5, review_text: 'Excellent service! The engine works perfectly and installation was done same day. Highly recommend Roshanal Infotech.', submitted_at: '2024-01-20', published_to_social: true },
    { id: '2', customer_name: 'Grace Ade', product: 'Hikvision 8-Camera System', platform: 'facebook', rating: 5, review_text: 'Very professional team. They installed 8 cameras at my shop in one day. The quality is amazing.', submitted_at: '2024-02-01', published_to_social: true },
    { id: '3', customer_name: 'Chief Okoro', product: 'Solar Power System 5KVA', platform: 'whatsapp', rating: 4, review_text: 'Good product. Finally no more PHCN wahala. Installation took a bit longer than expected but overall satisfied.', submitted_at: '2024-02-10', published_to_social: false },
  ])

  const [requestForm, setRequestForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    product: '',
    message: 'Thank you for choosing Roshanal Infotech! We would appreciate if you could share your experience with us.',
  })

  const sendRequest = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/reviews/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestForm),
      })
      setShowRequestModal(false)
    } catch {
      console.error('Failed to send review request')
    }
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-clash text-2xl font-bold text-text-primary">Review Collector</h2>
          <p className="text-text-secondary mt-1">Request and manage customer reviews</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Request Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-6 h-6 ${i <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-text-muted'}`} />
            ))}
          </div>
          <p className="text-3xl font-bold text-text-primary">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-text-secondary">Average Rating</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-text-primary">{reviews.length}</p>
          <p className="text-sm text-text-secondary">Total Reviews</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-text-primary">{reviews.filter(r => r.published_to_social).length}</p>
          <p className="text-sm text-text-secondary">Published to Social</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-surface border border-border-subtle rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary-glow font-semibold">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{review.customer_name}</p>
                  <p className="text-xs text-text-muted">{review.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  review.platform === 'google' ? 'bg-blue-500/20 text-blue-400' :
                  review.platform === 'facebook' ? 'bg-indigo-500/20 text-indigo-400' :
                  review.platform === 'video' ? 'bg-red-500/20 text-red-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {review.platform}
                </span>
                {review.published_to_social ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-text-muted" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-text-muted'}`} />
              ))}
            </div>

            <p className="text-sm text-text-secondary">{review.review_text}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-ghost">
              <span className="text-xs text-text-muted">{review.submitted_at}</span>
              <div className="flex items-center gap-2">
                {!review.published_to_social && (
                  <button className="px-3 py-1.5 text-xs bg-accent-primary/20 text-accent-primary-glow rounded hover:bg-accent-primary/30 transition-colors flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Publish to Social
                  </button>
                )}
                <button className="px-3 py-1.5 text-xs border border-border-subtle rounded text-text-secondary hover:bg-bg-elevated transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-clash text-xl font-bold text-text-primary mb-4">Request Review</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Customer Name</label>
                <input
                  value={requestForm.customer_name}
                  onChange={e => setRequestForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full p-2.5 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Phone Number</label>
                <input
                  value={requestForm.customer_phone}
                  onChange={e => setRequestForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="w-full p-2.5 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Product/Service</label>
                <input
                  value={requestForm.product}
                  onChange={e => setRequestForm(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full p-2.5 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Message</label>
                <textarea
                  value={requestForm.message}
                  onChange={e => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full p-2.5 bg-bg-elevated border border-border-subtle rounded-lg text-sm resize-none text-text-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-bg-elevated"
                >
                  Cancel
                </button>
                <button
                  onClick={sendRequest}
                  className="flex-1 px-4 py-2.5 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

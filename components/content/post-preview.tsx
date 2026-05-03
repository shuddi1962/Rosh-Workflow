import { clsx } from 'clsx'
import { Share2, Hash, Phone } from 'lucide-react'

interface PostPreviewProps {
  caption: string
  hashtags: string[]
  cta: string
  platform: string
  division: string
}

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-600 to-blue-700',
  linkedin: 'from-blue-700 to-blue-800',
  twitter: 'from-gray-700 to-gray-800',
  whatsapp: 'from-green-500 to-green-600',
}

export function PostPreview({ caption, hashtags, cta, platform, division }: PostPreviewProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-border-subtle overflow-hidden',
        division === 'marine' && 'border-l-4 border-l-accent-primary',
        division === 'tech' && 'border-l-4 border-l-accent-purple'
      )}
    >
      <div className={clsx('px-4 py-2 bg-gradient-to-r text-white', platformColors[platform] || 'from-gray-600 to-gray-700')}>
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{platform}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap mb-4">
          {caption}
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.slice(0, 10).map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-border-ghost">
          <Phone className="w-4 h-4 text-accent-emerald" />
          <span className="text-sm text-accent-emerald font-medium">{cta}</span>
        </div>
      </div>
    </div>
  )
}

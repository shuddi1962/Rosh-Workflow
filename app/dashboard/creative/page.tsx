'use client'

import Link from 'next/link'
import {
  Image as ImageIcon,
  Clapperboard,
  Megaphone,
  Globe,
  FolderOpen,
  Sparkles,
  UserRound,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface ToolCard {
  icon: LucideIcon
  title: string
  desc: string
  href: string
  gradient: string
}

const TOOLS: ToolCard[] = [
  {
    icon: ImageIcon,
    title: 'Image Studio',
    desc: 'Generate product shots and marketing visuals with AI.',
    href: '/dashboard/creative/images',
    gradient: 'linear-gradient(135deg, #1468F5, #8B5CF6)',
  },
  {
    icon: Clapperboard,
    title: 'Video Studio',
    desc: 'Turn products into multi-scene marketing videos.',
    href: '/dashboard/creative/video',
    gradient: 'linear-gradient(135deg, #8B5CF6, #1468F5)',
  },
  {
    icon: Megaphone,
    title: 'Banner Studio',
    desc: 'Promo banners sized for WhatsApp, social and print.',
    href: '/dashboard/creative/banners',
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
  },
  {
    icon: Globe,
    title: 'URL Scraper',
    desc: 'Pull product photos, prices and specs from any supplier URL.',
    href: '/dashboard/creative/scraper',
    gradient: 'linear-gradient(135deg, #10B981, #1468F5)',
  },
  {
    icon: FolderOpen,
    title: 'Asset Library',
    desc: 'Every image, video and banner you generated, organized in one place.',
    href: '/dashboard/creative/library',
    gradient: 'linear-gradient(135deg, #F59E0B, #F97316)',
  },
  {
    icon: Sparkles,
    title: 'UGC Ad Builder',
    desc: 'Full pipeline: script to image to video ads.',
    href: '/dashboard/creative/ugc',
    gradient: 'linear-gradient(135deg, #EF4444, #8B5CF6)',
  },
  {
    icon: UserRound,
    title: 'Influencer Generator',
    desc: 'Create AI influencers who endorse your products.',
    href: '/dashboard/creative/influencer',
    gradient: 'linear-gradient(135deg, #10B981, #F59E0B)',
  },
]

export default function CreativeStudioPage() {
  return (
    <div>
      <PageHeader
        eyebrow="AI Creative Studio"
        title="Creative Studio"
        description="Every design tool in one place — images, video, banners and ad creatives."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {TOOLS.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="bg-white rounded-xl border border-border-subtle p-6 sm:p-8 hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/5 transition group h-full">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
                style={{ background: card.gradient }}
              >
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1.5">{card.title}</h3>
              <p className="text-text-secondary text-sm">{card.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-accent-primary font-medium mt-3">
                Open tool <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h3 className="font-semibold text-text-primary mb-1">Recent creations</h3>
          <p className="text-text-secondary text-sm">
            No creations yet. Start with Image Studio or the Influencer Generator.
          </p>
        </div>
        <Link
          href="/dashboard/creative/library"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm font-medium flex-shrink-0"
        >
          Open Asset Library <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

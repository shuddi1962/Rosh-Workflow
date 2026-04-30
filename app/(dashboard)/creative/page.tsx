import Link from 'next/link'

export default function CreativeStudioPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">🎨 AI Creative Studio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { 
            icon: '🖼️', 
            title: 'Image Studio', 
            desc: 'Generate product images for all formats',
            href: '/dashboard/creative/images',
            color: 'from-accent-blue to-blue-600'
          },
          { 
            icon: '👤', 
            title: 'Influencer Generator', 
            desc: 'Create AI influencers who endorse your products',
            href: '/dashboard/creative/influencer',
            color: 'from-accent-purple to-purple-600'
          },
          { 
            icon: '🎬', 
            title: 'Video Ad Creator', 
            desc: 'Animate products into video ads',
            href: '/dashboard/creative/video',
            color: 'from-accent-emerald to-emerald-600'
          },
          { 
            icon: '📱', 
            title: 'UGC Ad Builder', 
            desc: 'Full pipeline: Script → Image → Video',
            href: '/dashboard/creative/ugc',
            color: 'from-accent-gold to-yellow-600'
          },
        ].map((card, i) => (
          <Link key={i} href={card.href}>
            <div className="bg-bg-surface rounded-lg border border-border-subtle p-8 hover:border-border-hover transition group">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition`}>
                {card.icon}
              </div>
              <h3 className="font-clash font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-text-secondary text-sm">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">🕘 Recent Creations</h3>
        <p className="text-text-muted text-sm">No creations yet. Start with Image Studio or Influencer Generator.</p>
      </div>
    </div>
  )
}

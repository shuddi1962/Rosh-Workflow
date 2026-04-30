'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-void">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="font-clash text-2xl font-bold text-text-primary">ROSHANAL AI</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-text-secondary hover:text-text-primary transition">Login</Link>
          <Link href="/login" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">Get Started</Link>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6">
        <section className="py-20 text-center">
          <h2 className="font-clash text-5xl font-bold text-text-primary mb-6">
            Roshanal AI: Your 24/7 Marketing Engine
          </h2>
          <p className="text-text-secondary text-xl mb-8 max-w-2xl mx-auto">
            AI-powered content generation, competitor intelligence, and social automation for Roshanal Infotech Limited, Port Harcourt.
          </p>
          <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium text-lg">
            Start Free Trial
          </Link>
        </section>
        
        <section className="py-16">
          <h3 className="font-clash text-3xl font-bold text-text-primary text-center mb-12">What It Does</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Content AI', desc: 'Generate Nigerian-focused social posts with Claude AI' },
              { title: 'Competitor Spy', desc: 'Track competitor ads and content strategies' },
              { title: 'UGC Ads', desc: 'Create video scripts and ad copy automatically' },
              { title: 'Trend Monitor', desc: 'Live Google Trends + News API integration' },
              { title: 'Lead Gen', desc: 'Scrape and manage leads from Google Maps' },
              { title: 'Social Automation', desc: 'Schedule and auto-post to all platforms' }
            ].map((feature, i) => (
              <div key={i} className="bg-bg-surface rounded-lg border border-border-subtle p-6 hover:border-border-hover transition">
                <h4 className="font-clash font-semibold text-text-primary mb-2">{feature.title}</h4>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="py-16 text-center">
          <h3 className="font-clash text-3xl font-bold text-text-primary mb-6">Ready to Grow Your Business?</h3>
          <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-void rounded-lg font-medium text-lg">
            Login to Dashboard
          </Link>
        </section>
      </main>
    </div>
  )
}

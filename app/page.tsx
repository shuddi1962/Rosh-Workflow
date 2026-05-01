'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  Search,
  Video,
  TrendingUp,
  Users,
  Share2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Zap,
  BarChart3,
  MessageCircle,
  Shield,
  ChevronRight,
  Target,
  Globe,
  Clock
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const features = [
  {
    icon: Brain,
    title: 'AI Content Engine',
    description: 'Generate Nigerian-focused social media posts, ads, and marketing copy with Claude AI. Tailored for Port Harcourt businesses.',
    glow: 'from-blue-500/20 to-transparent',
    border: 'border-blue-500/20'
  },
  {
    icon: Search,
    title: 'Competitor Intelligence',
    description: 'Track competitor ads, content strategies, and discover gaps in the market you can exploit immediately.',
    glow: 'from-purple-500/20 to-transparent',
    border: 'border-purple-500/20'
  },
  {
    icon: Video,
    title: 'UGC Ad Creator',
    description: 'Create video scripts, ad copy, and campaign materials automatically for all platforms.',
    glow: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Live Trend Monitor',
    description: 'Real-time Google Trends, news alerts, and social trends matched to your products and services.',
    glow: 'from-amber-500/20 to-transparent',
    border: 'border-amber-500/20'
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Scrape and manage leads from Google Maps, LinkedIn, and Instagram. AI-qualified and scored automatically.',
    glow: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/20'
  },
  {
    icon: Share2,
    title: 'Social Automation',
    description: 'Schedule and auto-post to Instagram, Facebook, WhatsApp, LinkedIn, Twitter, and TikTok with optimal timing.',
    glow: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/20'
  }
]

const stats = [
  { value: '10x', label: 'Faster Content Creation' },
  { value: '24/7', label: 'Automated Marketing' },
  { value: '50+', label: 'Content Types Generated' },
  { value: '7', label: 'Platforms Connected' }
]

const howItWorks = [
  {
    step: '01',
    title: 'Set Up Your Business Profile',
    description: 'Add your products, target audience, brand voice, and contact information. Our AI learns your business.',
    icon: Shield
  },
  {
    step: '02',
    title: 'AI Generates Content Daily',
    description: 'Based on live trends, competitor activity, and your product catalog, our AI creates ready-to-post content.',
    icon: Sparkles
  },
  {
    step: '03',
    title: 'Review, Approve & Schedule',
    description: 'Review AI-generated content, make edits if needed, and schedule for automatic publishing across all platforms.',
    icon: Zap
  },
  {
    step: '04',
    title: 'Track Results & Optimize',
    description: 'Monitor engagement, leads generated, and campaign performance. AI learns and improves over time.',
    icon: BarChart3
  }
]

const integrations = [
  { name: 'Instagram', icon: Globe },
  { name: 'Facebook', icon: Globe },
  { name: 'WhatsApp', icon: MessageCircle },
  { name: 'LinkedIn', icon: Globe },
  { name: 'Twitter/X', icon: Globe },
  { name: 'TikTok', icon: Globe },
  { name: 'Claude AI', icon: Brain },
  { name: 'Google Trends', icon: TrendingUp }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#04060F] text-[#F0F4FF] overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#04060F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-6 lg:px-12 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-clash text-xl font-bold text-[#F0F4FF]">Roshanal AI</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/login" className="text-[#8B9CC8] hover:text-[#F0F4FF] transition font-medium">
              Login
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 lg:px-12">
          <div className="w-full">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center max-w-5xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="mb-8">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Marketing Platform for Nigeria
                </span>
              </motion.div>
              
              <motion.h1
                variants={fadeInUp}
                className="font-clash text-5xl md:text-6xl lg:text-7xl font-bold text-[#F0F4FF] leading-[1.1] mb-8"
              >
                Your 24/7{' '}
                <span className="bg-gradient-to-r from-[#1A56DB] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                  Marketing Engine
                </span>
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-xl text-[#8B9CC8] mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Generate Nigerian-focused content, spy on competitors, automate social media, and capture leads — all powered by AI built for Port Harcourt businesses.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] text-white rounded-xl font-medium text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-[#F0F4FF] rounded-xl font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-white/3 border border-white/5">
                  <div className="font-clash text-4xl font-bold bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[#8B9CC8] text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 lg:px-12">
          <div className="w-full">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="font-clash text-4xl font-bold text-[#F0F4FF] mb-4"
              >
                Everything You Need to Dominate Your Market
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-[#8B9CC8] max-w-2xl mx-auto"
              >
                From content creation to competitor analysis, lead generation to social automation — all in one platform.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="group bg-[#0E1220] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.glow} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border ${feature.border}`}>
                    <feature.icon className="w-7 h-7 text-[#F0F4FF]" />
                  </div>
                  <h3 className="font-clash text-xl font-semibold text-[#F0F4FF] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#8B9CC8] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 lg:px-12 bg-[#080C1A]">
          <div className="w-full">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="font-clash text-4xl font-bold text-[#F0F4FF] mb-4">
                How It Works
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#8B9CC8] max-w-2xl mx-auto">
                Four simple steps to transform your marketing from manual to AI-powered.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {howItWorks.map((item, i) => (
                <motion.div key={i} variants={fadeInUp} className="relative">
                  <div className="text-7xl font-clash font-bold text-white/5 absolute -top-4 -left-2">
                    {item.step}
                  </div>
                  <div className="relative pt-10">
                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                      <item.icon className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="font-clash text-xl font-semibold text-[#F0F4FF] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[#8B9CC8] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Platform Integrations */}
        <section className="py-24 px-6 lg:px-12">
          <div className="w-full">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="font-clash text-4xl font-bold text-[#F0F4FF] mb-4">
                Connected to Every Platform
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#8B9CC8] max-w-2xl mx-auto">
                Seamless integration with all major social media and AI platforms.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {integrations.map((integration, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center gap-3 p-4 bg-[#0E1220] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <integration.icon className="w-5 h-5 text-[#8B9CC8]" />
                  <span className="text-[#F0F4FF] font-medium">{integration.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-12">
          <div className="w-full">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="relative rounded-3xl overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
              
              <div className="relative z-10 px-12 py-16 md:px-20 md:py-20 text-center">
                <motion.h2 variants={fadeInUp} className="font-clash text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Transform Your Marketing?
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Join Roshanal Infotech teams already using AI to generate content, track competitors, and capture leads automatically.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1A56DB] rounded-xl font-medium text-lg hover:shadow-xl transition-all duration-300"
                  >
                    Login to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-6 lg:px-12 border-t border-white/5">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-[#0E1220] rounded-2xl border border-white/5"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-[#F0F4FF] mb-2">Visit Us</div>
                  <div className="text-[#8B9CC8] text-sm leading-relaxed">
                    No 18A Rumuola/Rumuadaolu Road, Port Harcourt<br />
                    41 Eastern Bypass, Opp NDDC Building<br />
                    223 Chief Melfold Okilo Way, Yenegoa
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-6 bg-[#0E1220] rounded-2xl border border-white/5"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-[#F0F4FF] mb-2">Call Us</div>
                  <div className="text-[#8B9CC8] text-sm leading-relaxed">
                    08109522432<br />
                    08033170802<br />
                    08180388018
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 p-6 bg-[#0E1220] rounded-2xl border border-white/5"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-[#F0F4FF] mb-2">Email Us</div>
                  <div className="text-[#8B9CC8] text-sm leading-relaxed">
                    info@roshanalinfotech.com<br />
                    roshanalinfotech.com
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 lg:px-12 border-t border-white/5">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-clash font-bold text-[#F0F4FF]">Roshanal AI</span>
            </div>
            <p className="text-[#4A5475] text-sm">
              © 2026 Roshanal Infotech Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[#8B9CC8] text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp-first marketing for Nigeria</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

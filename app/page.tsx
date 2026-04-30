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
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  MessageCircle
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
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Search,
    title: 'Competitor Intelligence',
    description: 'Track competitor ads, content strategies, and discover gaps in the market you can exploit immediately.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Video,
    title: 'UGC Ad Creator',
    description: 'Create video scripts, ad copy, and campaign materials automatically for all platforms.',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    icon: TrendingUp,
    title: 'Live Trend Monitor',
    description: 'Real-time Google Trends, news alerts, and social trends matched to your products and services.',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Scrape and manage leads from Google Maps, LinkedIn, and Instagram. AI-qualified and scored automatically.',
    color: 'bg-rose-50 text-rose-600'
  },
  {
    icon: Share2,
    title: 'Social Automation',
    description: 'Schedule and auto-post to Instagram, Facebook, WhatsApp, LinkedIn, Twitter, and TikTok with optimal timing.',
    color: 'bg-indigo-50 text-indigo-600'
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

const testimonials = [
  {
    quote: "The competitor intelligence alone saved us months of trial and error. We now know exactly what works in Port Harcourt market.",
    author: 'Marine Division Manager',
    role: 'Roshanal Infotech'
  },
  {
    quote: "We went from posting once a week to daily content across all platforms. The AI understands our Nigerian audience perfectly.",
    author: 'Marketing Lead',
    role: 'Technology Division'
  },
  {
    quote: "Lead generation increased by 300% in the first month. The WhatsApp integration is a game-changer for Nigerian customers.",
    author: 'Sales Director',
    role: 'Port Harcourt Operations'
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-clash text-xl font-bold text-gray-900">Roshanal AI</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Login
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Marketing Platform for Nigeria
                </span>
              </motion.div>
              
              <motion.h1
                variants={fadeInUp}
                className="font-clash text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
              >
                Your 24/7{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Marketing Engine
                </span>
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Generate Nigerian-focused content, spy on competitors, automate social media, and capture leads — all powered by AI built for Port Harcourt businesses.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-lg hover:bg-gray-200 transition-all duration-300"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-clash text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="font-clash text-4xl font-bold text-gray-900 mb-4"
              >
                Everything You Need to Dominate Your Market
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
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
                  className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-clash text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="font-clash text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                  <div className="text-6xl font-clash font-bold text-gray-100 absolute -top-4 -left-2">
                    {item.step}
                  </div>
                  <div className="relative pt-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-clash text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="font-clash text-4xl font-bold text-white mb-4">
                Trusted by Roshanal Infotech Teams
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-blue-100 max-w-2xl mx-auto">
                See how our AI platform is transforming marketing for marine and technology divisions.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <CheckCircle2 key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white text-lg leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="bg-gray-50 rounded-3xl p-12 md:p-16 border border-gray-200"
            >
              <div className="text-center max-w-3xl mx-auto">
                <motion.h2 variants={fadeInUp} className="font-clash text-4xl font-bold text-gray-900 mb-4">
                  Ready to Transform Your Marketing?
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8">
                  Join Roshanal Infotech teams already using AI to generate content, track competitors, and capture leads automatically.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Login to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Visit Us</div>
                      <div className="text-gray-600 text-sm">No 18A Rumuola/Rumuadaolu Road, Port Harcourt</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Call Us</div>
                      <div className="text-gray-600 text-sm">08109522432 | 08033170802</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Email Us</div>
                      <div className="text-gray-600 text-sm">info@roshanalinfotech.com</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="py-12 px-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-clash font-bold text-gray-900">Roshanal AI</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 Roshanal Infotech Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp-first marketing for Nigeria</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

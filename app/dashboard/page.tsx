'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  Users,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react'

const kpiCards = [
  {
    title: 'Total Reach',
    value: '24.5K',
    change: '+12.3%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Posts This Week',
    value: '47',
    change: '+8.1%',
    trend: 'up' as const,
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    title: 'Leads Generated',
    value: '156',
    change: '+24.5%',
    trend: 'up' as const,
    icon: Users,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Campaigns Sent',
    value: '12',
    change: '-2.4%',
    trend: 'down' as const,
    icon: Megaphone,
    color: 'bg-amber-50 text-amber-600'
  }
]

const recentActivity = [
  {
    title: 'Content generated: "Suzuki 100HP Outboard Engine Spotlight"',
    time: '2 minutes ago',
    type: 'content'
  },
  {
    title: 'Scheduled post: Facebook - "PHCN Alternative: Solar Solutions"',
    time: '15 minutes ago',
    type: 'social'
  },
  {
    title: 'New lead scraped: "Marine Superintendent - NNPC"',
    time: '1 hour ago',
    type: 'lead'
  },
  {
    title: 'Competitor scan complete: "PH Marine Equipment Ltd"',
    time: '2 hours ago',
    type: 'competitor'
  },
  {
    title: 'WhatsApp campaign sent: 45 contacts',
    time: '3 hours ago',
    type: 'campaign'
  }
]

const upcomingPosts = [
  {
    title: 'Hikvision CCTV Installation Guide',
    platform: 'Instagram',
    time: 'Today, 7:00 PM',
    status: 'scheduled'
  },
  {
    title: 'Marine Safety Equipment Checklist',
    platform: 'Facebook',
    time: 'Tomorrow, 8:00 AM',
    status: 'scheduled'
  },
  {
    title: 'Solar vs Generator Cost Comparison',
    platform: 'LinkedIn',
    time: 'Tomorrow, 12:00 PM',
    status: 'scheduled'
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">
            Good morning, Demo User
          </h1>
          <p className="text-gray-600">
            Here is what is happening with your marketing today.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {kpiCards.map((kpi, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
                {kpi.value}
              </div>
              <div className="text-gray-500 text-sm">{kpi.title}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash text-xl font-semibold text-gray-900">
                Recent Activity
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">{activity.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Upcoming Posts
              </h2>
            </div>
            <div className="space-y-4">
              {upcomingPosts.map((post, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-900 text-sm font-medium">{post.title}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium">
                      {post.platform}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

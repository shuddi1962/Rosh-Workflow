'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { TenantProvider } from '@/lib/context/TenantContext'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-500">Loading workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <TenantProvider>
      <div className="min-h-screen bg-[#F6F9FD] flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <DashboardHeader />
          <main className="flex-1 w-full overflow-x-auto p-4 sm:p-6 lg:p-8">
            <div className="min-w-0 max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TenantProvider>
  )
}
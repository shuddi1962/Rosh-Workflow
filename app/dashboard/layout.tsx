'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { TenantProvider, useTenant } from '@/lib/context/TenantContext'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/TopNavbar'
import { RegisterBusinessModal } from '@/components/modals/RegisterBusinessModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <DashboardShell>{children}</DashboardShell>
    </TenantProvider>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isRegistrationOpen, setIsRegistrationOpen, registerBusiness } = useTenant()
  const router = useRouter()
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
    <div className="min-h-screen bg-[#F6F9FD] flex flex-col w-full relative">
      {/* premium ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-32 left-1/4 w-[520px] h-[320px] rounded-full bg-[#1468F5]/10 blur-[110px]" />
        <div className="absolute top-40 -right-24 w-[420px] h-[320px] rounded-full bg-[#8B5CF6]/10 blur-[110px]" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[260px] rounded-full bg-[#EF233C]/[0.06] blur-[110px]" />
      </div>
      <TopNavbar />
      <div className="flex flex-1 min-h-0 w-full relative z-10">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <main className="flex-1 w-full overflow-x-auto p-4 sm:p-6 lg:p-8">
            <div className="min-w-0 max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <RegisterBusinessModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSubmit={(data) => registerBusiness(data)}
      />
    </div>
  )
}

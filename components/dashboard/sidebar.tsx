"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Brain,
  TrendingUp,
  Search,
  Share2,
  Video,
  Megaphone,
  Package,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  MessageSquare,
  ImageIcon,
  Phone,
  FileText,
  Zap,
  Mail,
  Shield,
  Star,
  Gift,
  Printer,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Warehouse,
  Receipt,
  CalendarCheck,
  ClipboardList,
} from "lucide-react"
import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { Lock } from "lucide-react"
import { useTenant } from "@/lib/context/TenantContext"
import { moduleAccessible, MODULE_MIN_PLAN } from "@/lib/plans"
import { roleAllows } from "@/lib/roles"

// Minimum plan per workspace route. Routes not listed are open to all plans.
const HREF_MIN_PLAN: Record<string, keyof typeof MODULE_MIN_PLAN | string> = {
  "/dashboard/content": "content",
  "/dashboard/trends": "trends",
  "/dashboard/competitors": "competitors",
  "/dashboard/crm": "crm",
  "/dashboard/crm/leads": "crm",
  "/dashboard/crm/qualification": "crm",
  "/dashboard/social": "social",
  "/dashboard/campaigns": "campaigns",
  "/dashboard/campaigns/create": "campaigns",
  "/dashboard/campaigns/templates": "campaigns",
  "/dashboard/campaigns/automation": "automation",
  "/dashboard/creative/images": "creative",
  "/dashboard/creative/video": "video",
  "/dashboard/creative/banners": "creative",
  "/dashboard/creative/scraper": "creative",
  "/dashboard/creative/library": "creative",
  "/dashboard/creative/ugc": "ugc",
  "/dashboard/voice/agents": "voice",
  "/dashboard/whatsapp": "whatsapp",
  "/dashboard/reviews": "whatsapp",
  "/dashboard/referrals": "whatsapp",
  "/dashboard/print": "whatsapp",
  "/dashboard/analytics": "analytics",
  "/dashboard/work": "work",
}

// Workspace route → module key for department role checks.
const HREF_MODULE: Record<string, string> = {
  "/dashboard": "overview",
  "/dashboard/content": "content",
  "/dashboard/trends": "trends",
  "/dashboard/competitors": "competitors",
  "/dashboard/crm": "crm",
  "/dashboard/crm/leads": "crm",
  "/dashboard/crm/qualification": "crm",
  "/dashboard/social": "social",
  "/dashboard/campaigns": "campaigns",
  "/dashboard/campaigns/create": "campaigns",
  "/dashboard/campaigns/templates": "campaigns",
  "/dashboard/campaigns/automation": "campaigns",
  "/dashboard/products": "products",
  "/dashboard/inventory": "inventory",
  "/dashboard/documents": "documents",
  "/dashboard/work": "work",
  "/dashboard/operations": "overview",
  "/dashboard/creative/images": "creative",
  "/dashboard/creative/video": "creative",
  "/dashboard/creative/banners": "creative",
  "/dashboard/creative/scraper": "creative",
  "/dashboard/creative/library": "creative",
  "/dashboard/creative/ugc": "ugc",
  "/dashboard/voice/agents": "voice",
  "/dashboard/whatsapp": "whatsapp",
  "/dashboard/reviews": "whatsapp",
  "/dashboard/referrals": "whatsapp",
  "/dashboard/print": "whatsapp",
  "/dashboard/analytics": "analytics",
  "/dashboard/settings": "settings",
}

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Brain, label: "Content Brain", href: "/dashboard/content" },
  { icon: TrendingUp, label: "Trends", href: "/dashboard/trends" },
  { icon: Search, label: "Competitors", href: "/dashboard/competitors" },
  { icon: Users, label: "CRM Pipeline", href: "/dashboard/crm" },
  { icon: Share2, label: "Social Media", href: "/dashboard/social" },
  { icon: Megaphone, label: "Campaigns", href: "/dashboard/campaigns" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

const creativeSubItems = [
  { icon: ImageIcon, label: "Image Generator", href: "/dashboard/creative/images" },
  { icon: Video, label: "Video Studio", href: "/dashboard/creative/video" },
  { icon: FileText, label: "Banner Studio", href: "/dashboard/creative/banners" },
  { icon: Search, label: "URL Scraper", href: "/dashboard/creative/scraper" },
  { icon: FolderOpen, label: "Asset Library", href: "/dashboard/creative/library" },
  { icon: Share2, label: "UGC Creator", href: "/dashboard/creative/ugc" },
]

const crmSubItems = [
  { icon: Users, label: "Pipeline", href: "/dashboard/crm" },
  { icon: Users, label: "All Leads", href: "/dashboard/crm/leads" },
  { icon: Zap, label: "Qualification", href: "/dashboard/crm/qualification" },
]

const campaignSubItems = [
  { icon: Megaphone, label: "All Campaigns", href: "/dashboard/campaigns" },
  { icon: Zap, label: "Campaign Builder", href: "/dashboard/campaigns/create" },
  { icon: Mail, label: "Email Templates", href: "/dashboard/campaigns/templates" },
  { icon: Shield, label: "Automation", href: "/dashboard/campaigns/automation" },
]

const operationsSubItems = [
  { icon: ClipboardList, label: "Overview", href: "/dashboard/operations" },
  { icon: Warehouse, label: "Inventory", href: "/dashboard/inventory" },
  { icon: Receipt, label: "Receipt Custody", href: "/dashboard/documents" },
  { icon: CalendarCheck, label: "Schedule & Reports", href: "/dashboard/work" },
]

const bonusItems = [
  { icon: MessageSquare, label: "WhatsApp Inbox", href: "/dashboard/whatsapp" },
  { icon: Phone, label: "Voice Agents", href: "/dashboard/voice/agents" },
  { icon: Star, label: "Reviews", href: "/dashboard/reviews" },
  { icon: Gift, label: "Referrals", href: "/dashboard/referrals" },
  { icon: Printer, label: "Print Center", href: "/dashboard/print" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("User")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operations: true,
    creative: false,
    crm: false,
    campaigns: false,
    bonus: false,
  })

  const { currentTenant } = useTenant()
  const [staffRole, setStaffRole] = useState<string | null>(null)

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
    setStaffRole(localStorage.getItem("staffRole"))
  }, [])

  const planLocked = (href: string): string | null => {
    const key = HREF_MIN_PLAN[href]
    if (!key) return null
    const min = MODULE_MIN_PLAN[key as keyof typeof MODULE_MIN_PLAN] || "Starter"
    return moduleAccessible(currentTenant.plan, min) ? null : min
  }

  const roleLocked = (href: string): boolean => {
    const mod = HREF_MODULE[href]
    if (!mod) return false
    return !roleAllows(staffRole, mod)
  }

  const goLocked = () => {
    window.location.href = "/#pricing"
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userDepartment")
    localStorage.removeItem("staffRole")
    localStorage.removeItem("businessId")
    router.push("/login")
  }

  const NavItem = ({ icon: Icon, label, href }: { icon: typeof LayoutDashboard; label: string; href: string }) => {
    const active = isActive(href)
    const lockedPlan = planLocked(href)
    const lockedRole = !lockedPlan && roleLocked(href)
    return (
      <button
        onClick={() => {
          if (lockedPlan) { goLocked(); return }
          if (lockedRole) return
          router.push(href)
          setSidebarOpen(false)
        }}
        title={lockedPlan ? `Requires ${lockedPlan} plan — click to see upgrade options` : lockedRole ? 'Not included in your staff role' : label}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-accent-primary/10 text-accent-primary-glow border-l-2 border-accent-primary"
            : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
          (lockedPlan || lockedRole) && "opacity-60"
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {lockedPlan && <Lock className="w-4 h-4 text-accent-gold flex-shrink-0" />}
        {lockedRole && <Lock className="w-4 h-4 text-text-muted flex-shrink-0" />}
      </button>
    )
  }

  const CollapsibleSection = ({ title, items, sectionKey }: { title: string; items: typeof creativeSubItems; sectionKey: string }) => {
    const isExpanded = expandedSections[sectionKey]
    const isActiveSection = items.some(item => isActive(item.href))
    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={clsx(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            isActiveSection ? "text-accent-primary-glow" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <span>{title}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <div className="ml-4 space-y-1 border-l border-border-ghost pl-4">
            {items.map((item) => {
              const lockedPlan = planLocked(item.href)
              const lockedRole = !lockedPlan && roleLocked(item.href)
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (lockedPlan) { goLocked(); return }
                    if (lockedRole) return
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  title={lockedPlan ? `Requires ${lockedPlan} plan — click to see upgrade options` : lockedRole ? 'Not included in your staff role' : item.label}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "bg-accent-primary/10 text-accent-primary-glow"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                    (lockedPlan || lockedRole) && "opacity-60"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {lockedPlan && <Lock className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />}
                  {lockedRole && <Lock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-base border-r border-border-subtle flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-primary to-accent-primary-glow rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-text-on-accent" />
              </div>
              <span className="font-clash text-lg font-bold text-text-primary">GrowPilot</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavItem key={item.href} icon={item.icon} label={item.label} href={item.href} />
          ))}

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Operations</div>
          <CollapsibleSection title="Operations" items={operationsSubItems} sectionKey="operations" />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Creative Studio</div>
          <CollapsibleSection title="Creative Studio" items={creativeSubItems} sectionKey="creative" />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Growth Tools</div>
          <CollapsibleSection title="CRM Pipeline" items={crmSubItems} sectionKey="crm" />
          <CollapsibleSection title="Campaigns" items={campaignSubItems} sectionKey="campaigns" />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Extras</div>
          <CollapsibleSection title="Bonus Features" items={bonusItems} sectionKey="bonus" />
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary-glow font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
              <p className="text-xs text-text-muted">Operator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-accent-red/10 hover:text-accent-red transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 text-text-muted hover:text-text-primary bg-bg-surface p-2 rounded-lg border border-border-subtle"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  )
}

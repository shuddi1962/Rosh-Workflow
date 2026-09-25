"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Phone,
  Gift,
  Printer,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Warehouse,
  Receipt,
  CalendarCheck,
  ClipboardList,
  Cloud,
  Clock,
  Trash2,
  HardDrive,
  Users,
  Star,
} from "lucide-react"
import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { useTenant } from "@/lib/context/TenantContext"
import { moduleAccessible, planHas, MODULE_MIN_PLAN } from "@/lib/plans"
import { roleAllows } from "@/lib/roles"

// Minimum plan per workspace route. Routes not listed are open to all plans.
const HREF_MIN_PLAN: Record<string, keyof typeof MODULE_MIN_PLAN | string> = {
  "/dashboard/voice/agents": "voice",
  "/dashboard/reviews": "whatsapp",
  "/dashboard/referrals": "whatsapp",
  "/dashboard/print": "whatsapp",
  "/dashboard/work": "work",
  "/dashboard/drive": "drive",
}

// Workspace route → module key for department role checks.
const HREF_MODULE: Record<string, string> = {
  "/dashboard": "overview",
  "/dashboard/operations": "overview",
  "/dashboard/search": "overview",
  "/dashboard/inventory": "inventory",
  "/dashboard/documents": "documents",
  "/dashboard/work": "work",
  "/dashboard/drive": "drive",
}

type SubItem = { icon: typeof LayoutDashboard; label: string; href: string }

// ─────────────────────────────────────────────────────────────
// LEFT sidebar scope (Workspace rail):
//   Overview home · Operations · Cloud Drive · unique Extras.
// Everything else (Content, Trends, Competitors, CRM, Social,
// Campaigns, Products, Commerce, Creative, Automation, Build,
// Analytics, Settings…) lives ONLY in the TOP header mega-menu
// (lib/nav-config.ts). No href appears in both navs.
// ─────────────────────────────────────────────────────────────

const homeItem = { icon: LayoutDashboard, label: "Overview", href: "/dashboard" }

const operationsSubItems: SubItem[] = [
  { icon: ClipboardList, label: "Overview", href: "/dashboard/operations" },
  { icon: Search, label: "Universal Search", href: "/dashboard/search" },
  { icon: Warehouse, label: "Inventory", href: "/dashboard/inventory" },
  { icon: Receipt, label: "Receipt Custody", href: "/dashboard/documents" },
  { icon: CalendarCheck, label: "Schedule & Reports", href: "/dashboard/work" },
]

const driveSubItems: SubItem[] = [
  { icon: Cloud, label: "My Drive", href: "/dashboard/drive" },
  { icon: Users, label: "Shared with me", href: "/dashboard/drive?view=shared" },
  { icon: Clock, label: "Recent", href: "/dashboard/drive?view=recent" },
  { icon: Star, label: "Starred", href: "/dashboard/drive?view=starred" },
  { icon: Trash2, label: "Trash", href: "/dashboard/drive?view=trash" },
  { icon: HardDrive, label: "Storage", href: "/dashboard/drive?view=storage" },
]

// Only extras NOT covered by the top mega-menu.
const extrasItems: SubItem[] = [
  { icon: Phone, label: "Voice Agents", href: "/dashboard/voice/agents" },
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
    drive: true,
    extras: true,
  })

  const { currentTenant } = useTenant()
  const [staffRole, setStaffRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
    setStaffRole(localStorage.getItem("staffRole"))
    setIsAdmin(localStorage.getItem("userRole") === "admin")
  }, [])

  // No padlocks anywhere in the sidebar. Visibility is purely plan + role
  // based: a workspace only sees the modules its plan includes. Platform
  // admins and Enterprise workspaces (incl. the Roshanal Team workspace)
  // see everything.
  const seesEverything = isAdmin || planHas(currentTenant.plan, "Enterprise")

  const planExcluded = (href: string): boolean => {
    const key = HREF_MIN_PLAN[href.split("?")[0]]
    if (!key) return false
    const min = MODULE_MIN_PLAN[key as keyof typeof MODULE_MIN_PLAN] || "Starter"
    return !moduleAccessible(currentTenant.plan, min)
  }

  const roleExcluded = (href: string): boolean => {
    const mod = HREF_MODULE[href.split("?")[0]]
    if (!mod) return false
    return !roleAllows(staffRole, mod)
  }

  const canSee = (href: string): boolean => {
    if (seesEverything) return true
    return !planExcluded(href) && !roleExcluded(href)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const sectionVisible = (items: Array<{ href: string }>) => items.some((i) => canSee(i.href))

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
    if (!canSee(href)) return null
    const active = isActive(href)
    return (
      <button
        onClick={() => {
          router.push(href)
          setSidebarOpen(false)
        }}
        title={label}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-accent-primary/10 text-accent-primary-glow border-l-2 border-accent-primary"
            : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{label}</span>
      </button>
    )
  }

  const CollapsibleSection = ({ title, items, sectionKey }: { title: string; items: SubItem[]; sectionKey: string }) => {
    const visibleItems = items.filter((item) => canSee(item.href))
    if (visibleItems.length === 0) return null
    const isExpanded = expandedSections[sectionKey]
    const isActiveSection = visibleItems.some(item => isActive(item.href))
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
            {visibleItems.map((item) => {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  title={item.label}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "bg-accent-primary/10 text-accent-primary-glow"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
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
        {/* Brand lives once in the top header — no duplicate logo here. */}
        <div className="px-4 pt-4 lg:hidden">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-text-muted hover:text-text-primary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Workspace</div>
          <NavItem icon={homeItem.icon} label={homeItem.label} href={homeItem.href} />

          {sectionVisible(operationsSubItems) && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Operations</div>
              <CollapsibleSection title="Operations" items={operationsSubItems} sectionKey="operations" />
            </>
          )}

          {sectionVisible(driveSubItems) && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Cloud Drive</div>
              <CollapsibleSection title="Cloud Drive" items={driveSubItems} sectionKey="drive" />
            </>
          )}

          {sectionVisible(extrasItems) && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Extras</div>
              <CollapsibleSection title="Extras" items={extrasItems} sectionKey="extras" />
            </>
          )}

          <p className="pt-4 px-3 text-[11px] leading-relaxed text-text-muted">
            All growth modules (Content, CRM, Social, Ads, Commerce, Creative…) live in the top menu ☝️
          </p>
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

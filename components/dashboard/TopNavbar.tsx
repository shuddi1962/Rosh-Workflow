"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  LogOut,
  Plus,
  LayoutDashboard,
  Hexagon,
} from "lucide-react";
import { clsx } from "clsx";
import { TOP_NAV, ALL_NAV_LINKS } from "@/lib/nav-config";
import { useTenant } from "@/lib/context/TenantContext";

function isActivePath(pathname: string, href: string) {
  const clean = href.split("?")[0];
  if (clean === "/dashboard") return pathname === "/dashboard";
  return pathname === clean || pathname.startsWith(clean + "/");
}

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTenant, tenants, switchTenant, setIsRegistrationOpen } = useTenant();

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [userName, setUserName] = useState("Operator");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const n = localStorage.getItem("userName");
    if (n) setUserName(n);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  const openWithDelayCancel = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  };

  const activeGroup = useMemo(
    () => TOP_NAV.find((g) => g.children.some((c) => isActivePath(pathname, c.href)))?.label ?? null,
    [pathname]
  );

  const filteredMobile = useMemo(() => {
    const q = mobileQuery.trim().toLowerCase();
    if (!q) return TOP_NAV;
    return TOP_NAV.map((g) => ({
      ...g,
      children: g.children.filter(
        (c) => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      ),
    })).filter((g) => g.children.length > 0);
  }, [mobileQuery]);

  const go = (href: string) => {
    setOpenGroup(null);
    setMobileOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("staffRole");
    localStorage.removeItem("businessId");
    router.push("/login");
  };

  const globalResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_NAV_LINKS.filter(
      (l) => l.label.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [query]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* premium gradient hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#1468F5] via-[#8B5CF6] to-[#EF233C]" />
        <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_8px_30px_-12px_rgba(20,104,245,0.25)]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            {/* Row 1 */}
            <div className="h-16 flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo */}
              <button onClick={() => go("/dashboard")} className="flex items-center gap-2.5 shrink-0 group">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1468F5] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                <span className="text-left leading-none">
                  <span className="block font-extrabold tracking-tight text-slate-900 text-[17px]">
                    Zorixza
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Roshanal AI
                  </span>
                </span>
              </button>

              {/* Desktop nav */}
              <nav className="hidden xl:flex items-center gap-1 ml-4 flex-1" onMouseLeave={scheduleClose}>
                {TOP_NAV.map((group) => {
                  const isOpen = openGroup === group.label;
                  const isGroupActive = activeGroup === group.label;
                  const Icon = group.icon;
                  return (
                    <div
                      key={group.label}
                      className="relative"
                      onMouseEnter={() => openWithDelayCancel(group.label)}
                    >
                      <button
                        onClick={() => setOpenGroup(isOpen ? null : group.label)}
                        className={clsx(
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13.5px] font-semibold transition-all whitespace-nowrap",
                          isOpen
                            ? "bg-[#1468F5]/10 text-[#1468F5]"
                            : isGroupActive
                              ? "text-[#1468F5] bg-[#1468F5]/5"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="w-4 h-4 opacity-70" />
                        {group.label}
                        <ChevronDown
                          className={clsx("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")}
                        />
                      </button>
                      {isGroupActive && !isOpen && (
                        <span className="absolute -bottom-[13px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#1468F5] to-[#8B5CF6]" />
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Right cluster */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Global search */}
                <div className="hidden md:block relative">
                  <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#1468F5]/50 focus-within:ring-4 focus-within:ring-[#1468F5]/10 transition-all w-56 lg:w-64">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && query.trim().length >= 2) {
                          if (globalResults[0]) go(globalResults[0].href);
                          else router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
                          setQuery("");
                        }
                      }}
                      placeholder="Search tools, pages…"
                      className="bg-transparent text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none w-full"
                    />
                  </div>
                  {query.trim().length >= 2 && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-2 z-50 overflow-hidden">
                      {globalResults.length === 0 ? (
                        <button
                          onClick={() => {
                            router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
                            setQuery("");
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50"
                        >
                          Search “{query.trim()}” everywhere →
                        </button>
                      ) : (
                        globalResults.map((r) => (
                          <button
                            key={r.href + r.label}
                            onClick={() => {
                              go(r.href);
                              setQuery("");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1468F5]/5 transition text-left group"
                          >
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 group-hover:from-[#1468F5]/15 group-hover:to-[#8B5CF6]/15">
                              <r.icon className="w-4 h-4 text-slate-600 group-hover:text-[#1468F5]" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-slate-800">{r.label}</span>
                              <span className="block text-[11px] text-slate-400 truncate">{r.desc}</span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setTenantOpen(false);
                    }}
                    className="relative p-2.5 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-slate-800"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF233C] rounded-full ring-2 ring-white" />
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">
                      <p className="text-[11px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
                        Notifications
                      </p>
                      {[
                        { t: "New lead qualified from WhatsApp", s: "2m ago · CRM" },
                        { t: "Competitor price alert detected", s: "18m ago · Intel" },
                        { t: "Campaign performance improved +12%", s: "1h ago · Marketing" },
                      ].map((n) => (
                        <div key={n.t} className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                          <p className="text-[13px] font-medium text-slate-700">{n.t}</p>
                          <p className="text-[11px] text-slate-400">{n.s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tenant switcher */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setTenantOpen(!tenantOpen);
                      setNotifOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                  >
                    <span className="text-lg leading-none">{currentTenant.logoEmoji}</span>
                    <span className="hidden lg:block text-left leading-tight">
                      <span className="block text-[12px] font-bold text-slate-800 max-w-[110px] truncate">
                        {currentTenant.name}
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-400">{currentTenant.plan}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {tenantOpen && (
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">
                      <p className="text-[11px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
                        Switch Business
                      </p>
                      {tenants.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            switchTenant(t.id);
                            setTenantOpen(false);
                          }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                            t.id === currentTenant.id
                              ? "bg-[#1468F5]/10 text-[#1468F5]"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <span className="text-lg">{t.logoEmoji}</span>
                          <span className="text-left min-w-0">
                            <span className="block font-semibold truncate">{t.name}</span>
                            <span className="block text-xs text-slate-400">{t.industry}</span>
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setTenantOpen(false);
                          setIsRegistrationOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1468F5] hover:bg-[#1468F5]/5 transition mt-1 border-t border-slate-100"
                      >
                        <span className="w-7 h-7 rounded-full bg-[#1468F5]/10 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </span>
                        Register New Business
                      </button>
                    </div>
                  )}
                </div>

                {/* Workspace switch — same login opens Zorixza Enterprise */}
                <button
                  onClick={() => go("/zorixza")}
                  title="Switch to Enterprise workspace"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  <Hexagon className="w-4 h-4" />
                  <span className="hidden lg:inline">Enterprise</span>
                </button>

                {/* Profile */}
                <div className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/20">
                  <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-extrabold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                  <span className="leading-tight hidden lg:block">
                    <span className="block text-[12px] font-bold max-w-[90px] truncate">{userName}</span>
                    <span className="block text-[10px] text-white/60 font-semibold">Operator</span>
                  </span>
                  <button onClick={handleLogout} title="Sign out" className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition">
                    <LogOut className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hover mega dropdown */}
          <AnimatePresence>
            {openGroup && (
              <motion.div
                key={openGroup}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={() => openWithDelayCancel(openGroup)}
                onMouseLeave={scheduleClose}
                className="hidden xl:block absolute left-0 right-0 top-full z-50"
              >
                <div className="max-w-[1600px] mx-auto px-6 pb-4">
                  <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-[0_30px_80px_-20px_rgba(10,24,51,0.35)] overflow-hidden">
                    <div className="h-[3px] w-full bg-gradient-to-r from-[#1468F5] via-[#8B5CF6] to-[#EF233C]" />
                    <div className="p-5">
                      {TOP_NAV.filter((g) => g.label === openGroup).map((group) => (
                        <div key={group.label}>
                          <div className="flex items-center justify-between mb-4 px-1">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                              {group.label} · {group.children.length} tools
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium hidden lg:block">
                              Hover to explore — click to open
                            </p>
                          </div>
                          <div
                            className={clsx(
                              "grid gap-2",
                              group.children.length > 8
                                ? "grid-cols-4"
                                : group.children.length > 4
                                  ? "grid-cols-3"
                                  : "grid-cols-2 max-w-3xl"
                            )}
                          >
                            {group.children.map((child) => {
                              const active = isActivePath(pathname, child.href);
                              return (
                                <button
                                  key={child.label}
                                  onClick={() => go(child.href)}
                                  className={clsx(
                                    "group/item flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5",
                                    active
                                      ? "border-[#1468F5]/30 bg-[#1468F5]/[0.06] shadow-lg shadow-blue-500/10"
                                      : "border-slate-100 bg-slate-50/60 hover:border-[#1468F5]/30 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10"
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                      active
                                        ? "bg-gradient-to-br from-[#1468F5] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/30"
                                        : "bg-white border border-slate-200 text-slate-600 group-hover/item:bg-gradient-to-br group-hover/item:from-[#1468F5] group-hover/item:to-[#8B5CF6] group-hover/item:text-white group-hover/item:border-transparent group-hover/item:shadow-lg group-hover/item:shadow-blue-500/30"
                                    )}
                                  >
                                    <child.icon className="w-5 h-5" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                      <span className="text-[13.5px] font-bold text-slate-900">
                                        {child.label}
                                      </span>
                                      {child.isNew && (
                                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#10B981] to-[#34D399] text-white">
                                          New
                                        </span>
                                      )}
                                      {child.badge && (
                                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#1468F5]/10 text-[#1468F5]">
                                          {child.badge}
                                        </span>
                                      )}
                                    </span>
                                    <span className="block text-[12px] text-slate-500 leading-snug mt-0.5">
                                      {child.desc}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile active-group quick strip */}
        <div className="xl:hidden bg-white border-b border-slate-200/70 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 px-3 py-2 min-w-max">
            <button
              onClick={() => go("/dashboard")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition",
                pathname === "/dashboard" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Home
            </button>
            {TOP_NAV.map((g) => (
              <button
                key={g.label}
                onClick={() => go(g.children[0].href)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition",
                  activeGroup === g.label ? "bg-[#1468F5] text-white shadow-lg shadow-blue-500/30" : "bg-slate-100 text-slate-600"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] xl:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[86vw] max-w-sm bg-white z-[61] flex flex-col xl:hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1468F5] to-[#8B5CF6] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-900 leading-none">Zorixza</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-1">
                    All tools
                  </p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2.5">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    placeholder="Filter tools…"
                    className="bg-transparent text-sm w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {filteredMobile.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 px-2 mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.children.map((child) => {
                        const active = isActivePath(pathname, child.href);
                        return (
                          <button
                            key={child.label}
                            onClick={() => go(child.href)}
                            className={clsx(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition",
                              active ? "bg-[#1468F5]/10 text-[#1468F5]" : "hover:bg-slate-50 text-slate-700"
                            )}
                          >
                            <span
                              className={clsx(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                active ? "bg-[#1468F5] text-white" : "bg-slate-100 text-slate-500"
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-bold">{child.label}</span>
                              <span className="block text-xs text-slate-400 truncate">{child.desc}</span>
                            </span>
                            {child.isNew && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">
                                New
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => go("/zorixza")}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200"
                >
                  <Hexagon className="w-4 h-4" /> Switch to Enterprise (same login)
                </button>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{userName}</p>
                    <p className="text-xs text-slate-400">Operator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                  >
                    <LogOut className="w-4 h-4" /> Out
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

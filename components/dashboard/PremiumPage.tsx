"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface Stat {
  label: string;
  value: string;
  delta?: string;
  icon?: LucideIcon;
}

interface Action {
  label: string;
  href: string;
  primary?: boolean;
}

interface PremiumPageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  stats?: Stat[];
  actions?: Action[];
  children?: React.ReactNode;
}

/**
 * Shared premium page shell — gives every dashboard page the same
 * modern, high-end look: gradient hero, glass stats, CTA row.
 */
export function PremiumPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  gradient = "from-[#1468F5] via-[#3B82F6] to-[#8B5CF6]",
  stats = [],
  actions = [],
  children,
}: PremiumPageProps) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-24px_rgba(20,104,245,0.35)]"
      >
        <div className={clsx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", gradient)} />
        <div className="pointer-events-none absolute -right-20 -top-24 w-80 h-80 rounded-full bg-[#1468F5]/10 blur-[80px]" />
        <div className="pointer-events-none absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-[#8B5CF6]/10 blur-[80px]" />
        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl shrink-0", gradient)}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1468F5]">
              <Sparkles className="w-3.5 h-3.5" /> {eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">{description}</p>
          </div>
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => router.push(a.href)}
                  className={clsx(
                    "group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                    a.primary
                      ? "bg-slate-900 text-white hover:bg-[#1468F5] shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-700 hover:bg-white hover:shadow-lg border border-slate-200"
                  )}
                >
                  {a.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          )}
        </div>
        {stats.length > 0 && (
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 sm:px-8 pb-6 sm:pb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2">
                  {s.icon && <s.icon className="w-4 h-4 text-[#1468F5]" />}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">{s.value}</p>
                {s.delta && <p className="text-[11px] font-bold text-emerald-600 mt-0.5">{s.delta}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {children && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}

export function PremiumCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_-24px_rgba(10,24,51,0.25)] hover:shadow-[0_24px_60px_-20px_rgba(20,104,245,0.3)] transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

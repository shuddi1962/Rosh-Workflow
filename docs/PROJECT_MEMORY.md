# ZORIXZA — PROJECT MEMORY (resume system)

> Resume keyword: **ZORIXZA-RESUME**. When the developer sends it, the coding
> agent must read this file + `ZORIXZA-IMPLEMENTATION-STATUS.md` +
> `lib/zorixza/workspaces.ts` + `lib/zorixza/program.ts`, then continue from
> **Current task pointer** below. Do not restart. Do not skip unfinished
> acceptance criteria.

## Stack (verified, do not change without a decision entry)

- Next.js 14 App Router + TypeScript strict, Tailwind, shadcn-style UI.
- Database: Supabase Postgres via `DBClient` (`lib/insforge/server.ts`).
  **InsForge/Supabase-js wrapper only — never Prisma/Supabase-SSR rewrites.**
- Auth: JWT (15m access + 7d refresh cookie), `middleware.ts` gates
  `/dashboard/*`, `/zorixza/*`, `/admin/*`, `/api/*`. Admin needs `role=admin`.
- Enterprise shell: `app/zorixza/layout.tsx` ('use client') + registry
  `lib/zorixza/workspaces.ts` (single source of truth) + roadmap
  `app/zorixza/roadmap/page.tsx` + phases `lib/zorixza/program.ts`.
- UI kit: `components/zorixza/ui.tsx` (ZxKpi/Section/Loading/Error/Empty/
  PageHead), `components/zorixza/data.tsx` (useZxQuery/asArray/ZxTable/
  ZxBadge), `components/zorixza/WorkspaceShell.tsx` (module sub-nav).
- Client fetch: `zxFetch` + `AuthError → /login` (`lib/zorixza/client.ts`).

## Iron rules (from production incidents)

1. **Never pass a component/function (Lucide icon, render fn, handler) from a
   Server Component to a Client Component.** Module layouts that render
   `WorkspaceShell` with `icon=` MUST be `'use client'`. This exact bug broke
   the Vercel build (f65981c/44b4e7c) — fixed in 2b5b98a.
2. `export const dynamic` inside `'use client'` files is **ignored** — route
   segment config only works in Server Components.
3. Registry rule (§115/§116): `status: 'live'` ONLY when DB → API → UI →
   audit works on real data. Everything else is `'build'` → roadmap link.
   No fake dashboards, no dead buttons, no mock success.
4. Every mutation API: `requireAuth`/`requireRole` server-side + audit/event
   emit where the pattern exists. UI hiding is not security.
5. Push all commits to `main` (Vercel auto-deploys). Verify with `npm run build`.

## Live workspaces (real data, verified patterns)

Executive `/zorixza` · Reports `/zorixza/reports` · CRM `/zorixza/crm`
(dashboard/leads/customers) · Inventory `/zorixza/inventory`
(dashboard/stock/warehouses/movements/transfers) · Purchasing
`/zorixza/purchasing` (overview/suppliers/orders/receipts) · Operations
`/zorixza/operations` (dashboard/schedules/approvals inbox) · Documents
`/zorixza/documents` (custody/files/approvals) · Projects
`/zorixza/projects` (overview/list on work_schedules) · Field Service
`/zorixza/field` (overview/jobs/schedules) · HR `/zorixza/hr`
(overview/directory via `/api/hr/staff-directory`) · Marketing `/dashboard` ·
Admin `/admin`.

## Tables that exist (migrations 001–009 applied)

users, businesses, business_members, plans, subscriptions, customers,
suppliers, products, warehouses, warehouse_stock, inventory_movements,
purchase_orders, goods_receipts(+items), receipts(+custody_events),
work_schedules, daily/monthly_reports(+items), operations_notifications,
business_events, approvals, record_links, automation_rules(+triggers),
cloud_folders/files/versions/shares/links/activity, storage_plans/
subscriptions/usage/transactions, whatsapp_channels/conversations/messages,
campaigns(+sequences/events), leads, crm_activities, audit_logs, api_keys,
+ marketing/social/content/ugc/voice tables.

## Versioned but NOT YET APPLIED (run in Supabase SQL editor, in order)

- `supabase/010_sales.sql` — quotations, orders, waybills, deliveries, invoices.
- `supabase/011_accounting.sql` — CoA, periods, journals+lines, banks, recon,
  customer payments+allocations, supplier bills, budgets.
- `supabase/012_hr_audit.sql` — departments/positions, employees, attendance,
  leave, payroll runs+payslips, audit engagements/workpapers/findings.

## What is still build-status (roadmap has full per-module scope)

Sales UI (P8 — tables ready in 010), Accounting UI (P10 — tables ready in
011), AuditIQ UI (P11 — tables ready in 012), Recruitment/Attendance/Payroll
(P13–P15 — tables ready in 012), Installation, Support tickets, Assets,
Tasks & Calendar, Analytics builder, Notifications center, Global search,
Communication center, AI assistant, Automation UI, Portals, Billing UI,
Maps/GPS, Mobile PWA, MFA/security hardening, E2E tests.

## Current task pointer

- [x] Purchasing / Projects / Field / HR workspaces live; documents approvals
      inbox live; registry covers all 31 master-scope modules; 010–012
      versioned; roadmap renders full scope.
- [ ] NEXT: apply 010–012 in Supabase SQL editor, then build Sales workspace
      UI (P8) on the real tables, then Accounting UI (P10).
- [ ] AFTER: E2E acceptance journeys (§81): customer→quote→order→waybill→
      delivery→invoice→payment→receipt→AR→GL; PO→receipt→bill→payment→AP.

## Decisions log

- 2026-09-25: keep Supabase-js DBClient wrapper; no ORM migration.
- 2026-09-25: session-gated pages still statically prerender (client
  `dynamic` exports ignored); acceptable — build passes, revisit only if
  Vercel timeouts recur (then: root-layout force-dynamic).
- 2026-09-25: HR directory is a new read-only `requireAuth` API
  (`/api/hr/staff-directory`, password hashes stripped); user admin stays in
  `/admin` behind `requireRole(['admin'])`.

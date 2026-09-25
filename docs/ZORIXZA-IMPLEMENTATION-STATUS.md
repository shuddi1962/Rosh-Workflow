# ZORIXZA — IMPLEMENTATION STATUS

> Every feature: NOT STARTED · IN PROGRESS · BLOCKED · IMPLEMENTED · TESTING · VERIFIED
> "Complete" requires the §115 checklist (DB → migration → backend → API →
> auth → UI → validation → error/loading/empty states → audit → real data →
> mobile → tests → integration → docs → E2E). A page existing ≠ complete.

## Legend

- VERIFIED: checklist complete, real data, tested.
- IMPLEMENTED: works end-to-end, tests/audit pending.
- IN PROGRESS: partial (often UI shell only — see notes).
- NOT STARTED / BLOCKED as labelled.

## Phase 0 — Audit: VERIFIED (2026-09-25)

## Zorixza Enterprise shell (`/zorixza`): IMPLEMENTED

- Light Marketing-style shell with emerald sidebar + topbar, grouped workspace
  nav from `lib/zorixza/workspaces.ts` (single source: 12 live, 36 phased).
- Live workspaces link to real pages; phased workspaces open the real
  `/zorixza/roadmap?module=` view (scope, phase, reusable parts) — zero fake
  dashboards, zero dead buttons.
- Module workspaces (§73): CRM (dashboard/leads+create/customers+create),
  Inventory (dashboard/stock/warehouses+create/movements/transfers),
  Purchasing (overview/suppliers+create/orders+create/receipts),
  Operations (dashboard/schedules/approvals inbox with real approve/return/
  reject), Documents (custody/drive file browser/document approval inbox),
  Projects (overview/projects+create on work_schedules),
  Field Service (overview/jobs+dispatch/schedules),
  HR (overview/staff directory via read-only /api/hr/staff-directory) —
  each with own header, sub-nav and actions, all on real APIs. Global topbar
  carries the hover workspaces catalog; left rail stays contextual.

- Separate layout/brand/nav from `/dashboard` and `/admin`; middleware-protected.
- 10 Enterprise workspaces on real APIs with loading/error/empty states
  (overview, CRM, inventory, purchasing, operations, documents, projects,
  field, HR, reports). Tests pending → next: TESTING.
- Homepage presents GrowPilot + Zorixza as two businesses of one group.
- Resume protocol: `docs/PROJECT_MEMORY.md` (keyword ZORIXZA-RESUME).

## Global shell / navigation: IMPLEMENTED

- Top mega-menu + left workspace rail, zero href overlap (script-verified).
- Tablet/mobile drawer verified by code review; device QA pending → TESTING.

## Module matrix

| Module | Status | Notes |
|---|---|---|
| Auth (login/logout/me, JWT, middleware RBAC) | VERIFIED | Real; admin gate in middleware |
| Multi-tenancy (businesses, members, plans) | IMPLEMENTED | business_id scoping in code; backfill legacy rows pending |
| Roles (8 staff roles, module gating) | IMPLEMENTED | Module-level only; §10 granular action permissions NOT STARTED |
| CRM (leads CRUD, pipeline, qualify, scrape, activities, timeline) | IMPLEMENTED | Real APIs + pages; tests pending |
| Customers/Suppliers directory | IMPLEMENTED | Real APIs; tests pending |
| Products catalog (+images, import) | IMPLEMENTED | Real; tests pending |
| Inventory (stock, movements, transfers, GRN, PO, warehouses) | IMPLEMENTED | Real; accounting posting link NOT STARTED |
| Campaigns (CRUD, send, schedule, templates, automation, analytics) | IMPLEMENTED | Real; provider delivery proofs partial |
| Content Brain (generate, ideas, calendar, posts) | IMPLEMENTED | Real; tests pending |
| Social (accounts, posts, queue, auto-reply, webhooks) | IMPLEMENTED | Real; tests pending |
| Trends / Competitors (+gap analysis, scrape) | IMPLEMENTED | Real; tests pending |
| UGC / Creative (images, video, banners, library, scraper) | IMPLEMENTED | Real; tests pending |
| Voice (agents, calls, ElevenLabs webhook) | IMPLEMENTED | Real; tests pending |
| **Inbox (unified)** | TESTING | DONE: migration 009 (channels/conversations/messages) + real conversations/messages/send APIs + Meta webhook verify+persist+statuses + /dashboard/inbox rewired (threads, read receipts, send, polling, new chat) + 11 unit tests green. Needs: 009 run in SQL editor, live Meta end-to-end. |
| WhatsApp provider send | IMPLEMENTED | Persist-first; live Cloud API call when creds present, honest `queued`/`failed` otherwise (never fake success) |
| Documents (receipt custody) | IMPLEMENTED | Real; tests pending |
| Cloud Drive (files/folders/shares/versions/trash/quotas/billing) | IMPLEMENTED | Real; tests pending |
| Operations (overview, notifications, export, reminders, events) | IMPLEMENTED | Real; tests pending |
| Work reports/schedules (daily/monthly/schedules) | IMPLEMENTED | Real; approval-forward chain partial |
| Reviews / Referrals / Print | IMPLEMENTED | Real; tests pending |
| Approvals engine | IMPLEMENTED | Real; coverage per-module pending |
| Analytics + Admin (tenants, users, staff, keys, toggles, health) | IMPLEMENTED | Real; tests pending |
| Billing/subscriptions/storage plans | IMPLEMENTED | Real (Paystack/Flutterwave webhooks); tests pending |
| New module shells (30 pages: business-profile, prospecting, marketing/*, ads, commerce/*, creative/*, automation/*, build/*, team) | IN PROGRESS | **UI shells only — backend NOT built. Do not mark complete.** |
| Sales workspace (quotations, orders, waybills, deliveries, returns) | NOT STARTED | Tables versioned in 010_sales.sql (pending apply); UI next |
| Waybill extraction (OCR/AI verify-before-post) | NOT STARTED | 010 waybills table carries source/ocr_confidence/ocr_payload for the review screen |
| Purchasing (suppliers, PO, GRN) | IMPLEMENTED | Real workspace; RFQ, supplier quotes, bills, landed cost pending (bills table in 011) |
| Accounting (CoA, GL, journals, TB, AR/AP, bank recon, tax, close) | NOT STARTED | Tables versioned in 011_accounting.sql (pending apply) — Phase 10 |
| AuditIQ workspace | NOT STARTED | Tables versioned in 012_hr_audit.sql (pending apply) |
| HR (staff directory, headcount) | IMPLEMENTED | Real workspace on users/business_members; employee records, cases pending |
| Attendance / Leave / Training / Performance | NOT STARTED | Tables versioned in 012 (pending apply); device-import architecture pending |
| Payroll | NOT STARTED | Tables versioned in 012 (pending apply); jurisdiction rules TBD |
| Document Control workflows / retention | IMPLEMENTED | Drive + custody + document approval inbox real; retention rules pending |
| Projects / Field Service | IMPLEMENTED | Real workspaces on work_schedules; GPS, photos, checklists, sign-off pending |
| Installation / Support tickets / Assets / Tasks & Calendar | NOT STARTED | Registry scoped with planned pages; reuse pointers set |
| Communication center (unified history, provider abstraction) | IN PROGRESS | SendGrid/Twilio libs real; unified history pending |
| AI assistant / NL commands / global command center | NOT STARTED | Claude libs real; assistant UI pending |
| Analytics engine v2 (custom dashboards, saved views) | NOT STARTED | Charts on real data exist |
| Maps/GPS | NOT STARTED | Phase 24 |
| Portals (customer/vendor/employee) | NOT STARTED | Phase 25 |
| Mobile PWA / offline | NOT STARTED | Responsive only |
| Security hardening (MFA, lockout, device mgmt) | NOT STARTED | JWT + RBAC + audit exist |
| Observability / backups | NOT STARTED | Health endpoint exists |

## Audits (2026-09-25)

- Nav audit: **64/64 sidebar/top/Enterprise hrefs resolve to pages** — zero dead navigation.
- Blank-page sweep: `creative/ugc` is a real redirect; `admin/products` + lead `[id]` are real data pages; `voice/calls` upgraded from static empty state to the live `call_logs` API.
- Roadmap now renders the full P0–P33 program matrix (`lib/zorixza/program.ts`) — nothing hidden.

## Priority queue (next)

1. Apply 010_sales / 011_accounting / 012_hr_audit in Supabase SQL editor.
2. Sales workspace UI (P8) on the real tables (quotations → orders → waybills → delivery → invoice).
3. Accounting workspace UI (P10: CoA → journals → TB/P&L).
4. Finish Inbox slice → TESTING → VERIFIED.
5. Route audit (§136) across all pages including the new workspaces.

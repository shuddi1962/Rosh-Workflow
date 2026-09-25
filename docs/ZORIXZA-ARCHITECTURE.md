# ZORIXZA — ARCHITECTURE

## Stack (as found, reused)

- **Frontend:** Next.js 14 App Router, React 18, TypeScript strict,
  Tailwind CSS v4, Framer Motion, TanStack Query/Table, Zustand, Recharts,
  React Hook Form + Zod, Socket.io client, shadcn-style `components/ui`.
- **Backend:** Next.js Route Handlers (`app/api/**`), service/domain layer in
  `lib/**` (CustomerService-style per-module servers, e.g. `lib/drive/server.ts`,
  `lib/operations/*`). No business logic in components.
- **Database (runtime):** InsForge SDK via `DBClient` (`lib/insforge/server.ts`).
  Repo rule: InsForge ONLY (no Supabase client, Firebase, Prisma).
- **Schema record:** versioned SQL in `supabase/001–009*.sql` (run in order,
  idempotent). Runtime uses InsForge; SQL files are the portable schema contract
  (§63/§65/§101: PostgreSQL-compatible, no vendor business logic).
- **Queues/jobs:** BullMQ + Upstash Redis (`lib/queue.ts`, `lib/workers.ts`,
  `lib/scheduler.ts`); Vercel <60s route budget respected.
- **Storage:** object storage via `lib/drive/server.ts` (putObject abstraction);
  DB stores metadata + versions + shares + checksums (§70).
- **Realtime:** Socket.io events; DB remains authoritative (§58).

## Module boundaries (§4)

Identity (`lib/auth.ts`, middleware) · Tenancy (`businesses`,
`business_members`, `resolveBusinessId`) · CRM (`app/api/crm`, `lib/crm`) ·
Sales (partial) · Marketing (campaigns/content/social/trends/competitors/ugc) ·
Products/Inventory (`app/api/products`, `app/api/inventory`, `warehouses`) ·
Purchasing (partial: suppliers, PO, GRN) · Accounting (NOT STARTED) ·
AuditIQ (NOT STARTED) · HR (NOT STARTED) · Documents/Drive ·
Workflow (approvals, automation_rules) · Projects/Field/Support (NOT STARTED) ·
Communication (sendgrid/twilio libs, webhooks) · AI (claude/openrouter/kieai) ·
Analytics/Admin · Integrations (provider clients in `lib/*`, webhooks/*).

Shared entities glue modules: customers, products, inventory_movements,
receipts, record_links, business_events, audit_logs (§66/§125).

## Navigation (§11/§82)

- **Global top nav:** logo, business selector, global search, notifications,
  profile (`TopNavbar`); module catalog mega-menu (`lib/nav-config.ts`).
- **Left rail:** Workspace home, Operations, Cloud Drive, Extras.
- **Workspace dashboards (§12–13):** each major module owns its pages/widgets
  under `/dashboard/<module>`; dedicated sub-navs to be added per workspace
  as modules mature (CRM pipeline/leads/qualification pattern is the template).

## Deployment (§103–104)

- SaaS: Vercel frontend, InsForge backend, Upstash Redis.
- Portable: Docker/Compose-ready structure kept; no hard vendor coupling in
  domain code. Secrets only via env (§105).

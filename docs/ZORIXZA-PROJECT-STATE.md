# ZORIXZA — PROJECT STATE (session memory)

> Read this file FIRST at the start of every coding session, before doing anything else.
> Update it at the end of every major implementation session.
> Recovery command: **"ZORIXZA CONTINUE"**.

## Current phase / task

- Phase: **PHASE 0 complete → PHASE 4/6 in progress** (see Implementation Status).
- Current task: **Zorixza standalone shell + dual-business homepage**.
  `/zorixza/*` is a separate dashboard on its own layout/shell/brand,
  protected by middleware; homepage presents GrowPilot + Zorixza together.
- Next exact task: quality gates (tsc), then resume Inbox vertical slice
  (migration 009 → service → APIs → UI wiring → audit → test).
- Done: single login opens all shells (same accessToken + cookie; middleware
  covers /dashboard, /zorixza, /admin). Two-way switchers: Marketing header
  button + sidebar footer + mobile drawer → Enterprise; Enterprise header +
  sidebar → Marketing; Admin footer → Marketing + Enterprise.
- Fixed Admin → Enterprise bounce to /login: access_token cookie lived only
  15 min while localStorage persisted, so middleware rejected workspace
  switches after cookie expiry. Cookie maxAge extended to 7 days to match
  refresh-token/localStorage lifetime (`app/api/auth/login/route.ts`).
  Note: sessions minted before this fix still carry the 15-min cookie —
  one fresh login picks up the 7-day cookie.
- Fixed deeper cause of Enterprise bounce: the signed access JWT itself
  expires in 15 min, so API calls 401'd even with a valid cookie and the
  pages redirected to /login. Added POST /api/auth/refresh (7d httpOnly
  refresh cookie → fresh access cookie); Enterprise `zxFetch` auto-refreshes
  once and retries on 401; shell entry now verifies via /api/auth/me with
  refresh fallback instead of localStorage-only.
- Found + fixed ACTUAL root cause: `getAuth` (`lib/operations/server.ts`)
  read ONLY the `Authorization: Bearer` header and ignored the login cookie,
  while the Enterprise shell sends cookie-only requests — so every
  Enterprise data call 401'd and bounced to /login on any session, fresh or
  not. `getAuth` now falls back to the `access_token` cookie (same pattern
  as /api/auth/me). Added shared cookie-aware `requireAdminUser` and
  replaced 3 copy-pasted Bearer-only `requireAdmin` helpers in
  `app/api/admin/api-keys/**`. Remaining inline Bearer-only reads in other
  admin routes logged as follow-up (their UI sends Bearer, so unaffected).

## Completed tasks (Zorixza shell session)

- [x] `/zorixza` route group: own `layout.tsx` (slate-950 enterprise rail,
      Zorixza brand, 6 workspaces, auth check + middleware matcher).
- [x] Zorixza pages on REAL APIs only: overview (`operations/overview` +
      `crm/pipeline`), crm (`crm/leads`), inventory (`inventory` +
      `warehouses`), operations (`operations/overview`), documents
      (`documents/receipts`), reports (daily + monthly). All with
      loading/error/empty states. No fabricated numbers.
- [x] Homepage: `DualBusinessSection` (GrowPilot + Zorixza cards) inserted
      after hero; navbar Zorixza link (desktop + mobile).
- [x] Shared: `lib/zorixza/client.ts` (auth fetch), `components/zorixza/ui.tsx`.

## Completed tasks (earlier)

- [x] PHASE 0 audit (2026-09-25): ~190 API routes, 65 Supabase tables
      (migrations 001–008), 98 pages, JWT auth + middleware RBAC,
      business-scoped data access, InsForge SDK + Supabase dual stack.
- [x] Global shell split: top header mega-menu (`lib/nav-config.ts`,
      `components/dashboard/TopNavbar.tsx`) owns the module catalog;
      left sidebar (`components/dashboard/sidebar.tsx`) owns
      Workspace/Operations/Drive/Extras. Verified zero href overlap.
- [x] 30 module pages created as UI shells (tracked IN PROGRESS, not complete).
- [x] Docs memory files created under `/docs`.

## Incomplete tasks

- Inbox UI wiring to real WhatsApp APIs (in progress).
- All items marked IN PROGRESS / NOT STARTED in
  `docs/ZORIXZA-IMPLEMENTATION-STATUS.md`.

## Known issues

- `app/api/whatsapp/*` were stubs (empty arrays / fake success). Being replaced
  by real business-scoped persistence in this slice.
- 30 module pages are UI shells without backend — MUST NOT be presented as
  complete (§116). Each needs DB → API → UI → audit → test before VERIFIED.
- Zero test files existed before this session; `tests/` + `npm test`
  (tsx --test) introduced with inbox helper tests.
- Dual DB stack: Supabase SQL migrations + InsForge SDK at runtime.
  `DBClient` (`lib/insforge/server.ts`) is the runtime path used by routes.
- No accounting (GL/journal), HR (employees/payroll), AuditIQ, projects,
  field-service, or ticketing tables yet.

## Database migrations

- Applied (Supabase SQL editor, idempotent): 001_core_tables → 008_connected_bos.
- New: `supabase/009_whatsapp_inbox.sql` (whatsapp_conversations,
  whatsapp_messages). Must be run in Supabase SQL editor before deploy.

## Routes created (this session)

- None (Inbox reuses existing route paths with real implementations).

## Tests completed

- `tests/whatsapp-inbox.test.ts` — pure helper tests (phone normalize,
  direction/status validation, payload guards).

## Integrations connected

- None new. Existing: Meta webhooks (stub→inbound persist in progress),
  SendGrid, Twilio, Apify, Anthropic/OpenRouter, ElevenLabs, Paystack/Flutterwave.

## Environment requirements

- See `.env.example`. WhatsApp Cloud API optional: if `WHATSAPP_ACCESS_TOKEN`
  + `WHATSAPP_PHONE_NUMBER_ID` are absent, outbound messages are stored with
  status `queued` and a provider warning is returned (never fake success).

## Blocked tasks

- None currently.

## Decisions made

- Keep InsForge SDK (`DBClient`) as the runtime data path per repo rule
  (InsForge ONLY); Supabase SQL files remain the versioned schema record.
- Site-wide rename executed per owner: GrowPilot → Zorixza everywhere
  (UI, metadata, comments, SQL headers). Marketing workspace = Zorixza
  Marketing (`/dashboard`); enterprise workspace = Zorixza Enterprise
  (`/zorixza`). Company remains Roshanal Infotech Ltd. Verified: renames
  only (28 files, ~1 line each), zero feature/route/doc deletions —
  104 pages, all APIs, all nav items, all docs intact.
- No mass placeholder generation: new pages tracked IN PROGRESS until they
  meet the §115 completion checklist.

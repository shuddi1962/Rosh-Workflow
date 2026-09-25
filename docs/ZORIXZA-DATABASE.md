# ZORIXZA — DATABASE

## Convention

- Every schema change = new numbered idempotent migration in `supabase/`.
- Runtime data access ONLY via `DBClient` (`lib/insforge/server.ts`).
- Tenant isolation = `business_id` scoping in API code on every query
  (see `006_multitenant.sql` header + `resolveBusinessId` in `lib/drive/server.ts`).
- Money in minor units where applicable;<meta> financial posts immutable —
  reversal/adjustment only (§68). Idempotency keys on jobs/webhooks (§69).

## Migrations

| File | Tables |
|---|---|
| 001_core_tables.sql | users, business_profile, products, social_posts, trends, competitors, campaigns, leads(+), api_keys, audit_logs, feature_toggles, analytics_daily… |
| 002_crm_leads.sql | leads, crm_activities, call_logs, voice_agents |
| 003_campaigns_social.sql | campaigns extras, social_* |
| 004_system_analytics.sql | analytics, plans, subscriptions, storage_*… |
| 005_operations.sql | operations_notifications, daily/monthly_reports, schedules, receipts… |
| 006_multitenant.sql | businesses, business_members, plans |
| 007_storage.sql | cloud_files/folders/versions/shares/links/activity |
| 008_connected_bos.sql | approvals, automation_rules/triggers, business_events, customers, suppliers, warehouses, warehouse_stock, purchase_orders, goods_receipts, record_links, referrals, reviews… |
| 009_whatsapp_inbox.sql | whatsapp_conversations, whatsapp_messages |

## Key relationships (§66)

- customer → quotation → sales_order → waybill → delivery → invoice → payment → accounting *(sales chain tables NOT STARTED)*
- product → purchase_order → goods_receipt → warehouse_stock → inventory_movements → sales *(partial: PO/GRN/movements real)*
- employee → attendance → leave → payroll → accounting *(NOT STARTED)*
- document → workflow → approval → report → audit *(partial: approvals + custody real)*
- Meta inbound → whatsapp_messages → conversation → (lead link) → notification *(this slice)*

## Gaps (honest)

- No CoA/GL/journal/invoice-posting, employees/payroll/attendance, audit,
  projects/jobs/tickets tables → Phases 8–20.
- RLS is code-level scoping, not DB policies; backfill of `business_id` on
  legacy rows pending (noted in 006 header).

// Zorixza program — full phase matrix (P0–P33). Rendered verbatim on the
// roadmap page so nothing is hidden in a corner. Statuses mirror
// docs/ZORIXZA-IMPLEMENTATION-STATUS.md; update both together.

export type PhaseStatus = 'VERIFIED' | 'IMPLEMENTED' | 'IN PROGRESS' | 'NOT STARTED' | 'BLOCKED';

export interface ProgramPhase {
  id: string;
  label: string;
  status: PhaseStatus;
  detail: string;
}

export const PROGRAM_PHASES: ProgramPhase[] = [
  { id: 'P0', label: 'Existing application audit', status: 'VERIFIED', detail: '~190 APIs, 65 tables, JWT auth, business scoping mapped.' },
  { id: 'P1', label: 'Architecture & infrastructure', status: 'IMPLEMENTED', detail: 'Next.js + InsForge + BullMQ/Redis; service layers in lib/. Tests pending.' },
  { id: 'P2', label: 'Authentication & multi-tenancy', status: 'IMPLEMENTED', detail: 'JWT + refresh flow, middleware gates, businesses/members. Legacy row backfill pending.' },
  { id: 'P3', label: 'Roles & permissions', status: 'IMPLEMENTED', detail: '8 staff roles, module gating. Granular action permissions (crm.customer.view…) pending.' },
  { id: 'P4', label: 'Global shell & design system', status: 'IMPLEMENTED', detail: 'Top catalog + workspace rail + Enterprise shell. Device QA pending.' },
  { id: 'P5', label: 'Database foundation & migrations', status: 'IMPLEMENTED', detail: 'Migrations 001–009 applied. 010 sales / 011 accounting / 012 HR-audit versioned, pending SQL-editor apply.' },
  { id: 'P6', label: 'CRM & customers', status: 'IMPLEMENTED', detail: 'Leads, pipeline, qualify, customers, timeline. Tests pending.' },
  { id: 'P7', label: 'Products & inventory', status: 'IMPLEMENTED', detail: 'Catalog, stock, movements, transfers, GRN, warehouses. Tests pending.' },
  { id: 'P8', label: 'Sales, quotations, orders, waybills', status: 'NOT STARTED', detail: 'Quotations → orders → waybills → delivery → invoice chain to be built.' },
  { id: 'P9', label: 'Purchasing & suppliers', status: 'IMPLEMENTED', detail: 'Suppliers, PO, GRN live on real tables/APIs. RFQ, supplier quotes, bills, landed cost pending.' },
  { id: 'P10', label: 'Accounting & finance', status: 'NOT STARTED', detail: 'CoA, GL, journals, AR/AP, banking, close — no tables yet.' },
  { id: 'P11', label: 'AuditIQ', status: 'NOT STARTED', detail: 'Engagements, working papers, tests, findings, sign-off.' },
  { id: 'P12', label: 'HR core', status: 'IN PROGRESS', detail: 'Staff directory + headcount live on users/business_members. Employee records, documents, cases pending.' },
  { id: 'P13', label: 'Recruitment & ATS', status: 'NOT STARTED', detail: 'Requisitions, candidates, interviews, offers.' },
  { id: 'P14', label: 'Attendance, leave, training, performance', status: 'NOT STARTED', detail: 'Device integration architecture + manual flows.' },
  { id: 'P15', label: 'Payroll', status: 'NOT STARTED', detail: 'Jurisdiction-configurable earnings, deductions, payslips.' },
  { id: 'P16', label: 'Document Control & Cloud Storage', status: 'IMPLEMENTED', detail: 'Drive, custody, shares, versions, quotas + document approval inbox live. Retention rules pending.' },
  { id: 'P17', label: 'Reports, schedules & workflows', status: 'IMPLEMENTED', detail: 'Daily/monthly reports, schedules, approvals engine live.' },
  { id: 'P18', label: 'Projects & Field Service', status: 'IN PROGRESS', detail: 'Project tracking + field jobs/dispatch live on work_schedules. GPS, photos, checklists, sign-off pending.' },
  { id: 'P19', label: 'Installation Management', status: 'NOT STARTED', detail: 'Crews, equipment, site evidence, completion.' },
  { id: 'P20', label: 'Customer Support', status: 'NOT STARTED', detail: 'Tickets, SLA, resolution, satisfaction.' },
  { id: 'P21', label: 'Email, SMS & Communication', status: 'IN PROGRESS', detail: 'SendGrid/Twilio libs + real WhatsApp inbox live. Unified history pending.' },
  { id: 'P22', label: 'AI & natural-language operations', status: 'NOT STARTED', detail: 'Claude/OpenRouter libs exist; assistant UI pending.' },
  { id: 'P23', label: 'Analytics & dashboards', status: 'IN PROGRESS', detail: 'Real-data charts live; custom builder pending.' },
  { id: 'P24', label: 'Maps & GPS', status: 'NOT STARTED', detail: 'Provider + privacy model to be chosen.' },
  { id: 'P25', label: 'Customer/Vendor/Employee portals', status: 'NOT STARTED', detail: 'Scoped record-level access design pending.' },
  { id: 'P26', label: 'Integrations', status: 'IN PROGRESS', detail: 'Vault, webhooks, provider clients live. Marketplace UI pending.' },
  { id: 'P27', label: 'Mobile / PWA / offline', status: 'NOT STARTED', detail: 'Responsive only today.' },
  { id: 'P28', label: 'Security hardening', status: 'IN PROGRESS', detail: 'JWT+refresh, RBAC, audit live. MFA, lockout, device mgmt pending.' },
  { id: 'P29', label: 'Performance optimization', status: 'NOT STARTED', detail: 'Pagination in place; load testing pending.' },
  { id: 'P30', label: 'Testing & QA', status: 'IN PROGRESS', detail: 'npm test (tsx) introduced; inbox helpers covered. E2E pending.' },
  { id: 'P31', label: 'Deployment', status: 'IN PROGRESS', detail: 'Vercel SaaS path live; Docker/private-cloud prep pending.' },
  { id: 'P32', label: 'Production verification', status: 'NOT STARTED', detail: 'Acceptance journeys per §145.' },
  { id: 'P33', label: 'Final enterprise audit', status: 'NOT STARTED', detail: 'Route/button/form/security/performance audits.' },
];

export const PHASE_TONE: Record<PhaseStatus, string> = {
  VERIFIED: 'bg-emerald-600 text-white',
  IMPLEMENTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'IN PROGRESS': 'bg-amber-50 text-amber-700 border border-amber-200',
  'NOT STARTED': 'bg-slate-100 text-slate-500',
  BLOCKED: 'bg-red-50 text-red-600 border border-red-200',
};

// Zorixza Enterprise — workspace registry (single source of truth).
// Rule (§115/§116): status 'live' ONLY when DB → API → UI → audit works on
// real data. Status 'preview' means the workspace UI is visible with its full
// scope (see first, make real later) while its backend phase is pending —
// never a fake dashboard: previews carry no invented numbers and write no
// data. Everything else is 'build' and routes to the roadmap view.
//
// Coverage: every module of the Zorixza master scope (§3–§83) appears here
// exactly once — CRM, Sales, Marketing, Communication, Inventory, Products,
// Purchasing, Operations, Documents, Projects, Field Service, Installation,
// Support, Assets, Tasks & Calendar, Accounting, Finance, AuditIQ, HR,
// Recruitment, Attendance & Leave, Payroll, AI, Automation, Integrations,
// Portals, Billing, Notifications, Search, Administration. Each entry lists
// its own pages (what each page represents and does) and the parts already
// reusable, so nothing in the scope is left out or hidden.

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Megaphone,
  Package,
  Warehouse,
  ClipboardList,
  FolderOpen,
  Briefcase,
  Wrench,
  HardHat,
  LifeBuoy,
  Archive,
  ListTodo,
  Calculator,
  Wallet,
  ScanSearch,
  HeartHandshake,
  UserPlus,
  CalendarCheck,
  Banknote,
  BarChart3,
  Bot,
  Plug,
  ShieldCheck,
  Map,
  Zap,
  Bell,
  Search,
  Globe,
  CreditCard,
  Landmark,
  ReceiptText,
  Coins,
  Boxes,
  Target,
  PiggyBank,
  FileText,
  ShoppingBag,
  Factory,
  Truck,
  Gauge,
  Building2,
  GraduationCap,
  Building,
  HeartPulse,
  BedDouble,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export type WorkspaceStatus = 'live' | 'preview' | 'build';

export interface Workspace {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  status: WorkspaceStatus;
  /** Real route when live; roadmap deep-link when in build. */
  href: string;
  /** Master-prompt phase, e.g. 'P10'. */
  phase: string;
  /** Planned pages for build workspaces (real scope, not fake links). */
  plannedPages: string[];
  /** Existing tables/services already reusable. */
  reuse: string[];
}

export interface WorkspaceGroup {
  label: string;
  workspaces: Workspace[];
}

export const WORKSPACE_GROUPS: WorkspaceGroup[] = [
  {
    label: 'Overview',
    workspaces: [
      {
        id: 'executive', label: 'Executive Overview', desc: 'Live position across sales, stock, documents, work and approvals.', icon: LayoutDashboard,
        status: 'live', href: '/zorixza', phase: 'P4', plannedPages: [], reuse: ['operations/overview', 'crm/pipeline'],
      },
      {
        id: 'reports', label: 'Reports', desc: 'Daily and monthly staff submissions up the review chain.', icon: BarChart3,
        status: 'live', href: '/zorixza/reports', phase: 'P17', plannedPages: [], reuse: ['work/daily-reports', 'work/monthly-reports'],
      },
      {
        id: 'analytics', label: 'Analytics', desc: 'Cross-module KPIs, trends and exports.', icon: BarChart3,
        status: 'preview', href: '/zorixza/analytics', phase: 'P23',
        plannedPages: [
          'KPI dashboards — role-aware metric boards per module',
          'Revenue & expense trends — time-series from real transactions',
          'Inventory movement — in/out/transfer velocity and slow movers',
          'Workforce analytics — attendance, leave and output aggregates',
          'Exports — PDF/Excel/CSV with scheduled delivery',
        ],
        reuse: ['analytics/* APIs', 'Recharts'],
      },
      {
        id: 'notifications', label: 'Notifications', desc: 'One inbox for approvals, payments, stock, tasks and security alerts.', icon: Bell,
        status: 'preview', href: '/zorixza/notifications', phase: 'P17',
        plannedPages: [
          'Activity stream — every business event the user may see',
          'Notification preferences — per-category in-app/email/SMS control',
          'Alert rules — thresholds that raise stock, cash and SLA alerts',
        ],
        reuse: ['operations/notifications API', 'business_events', 'approvals'],
      },
      {
        id: 'search', label: 'Global Search', desc: 'Search customers, products, invoices, documents, jobs and people.', icon: Search,
        status: 'preview', href: '/zorixza/search', phase: 'P4',
        plannedPages: [
          'Universal search — tenant- and permission-scoped results',
          'Command palette — “create invoice”, “find customer ABC” actions',
          'Recent & saved searches — per-user history',
        ],
        reuse: ['search API', 'record_links', 'records/timeline'],
      },
    ],
  },
  {
    label: 'Revenue',
    workspaces: [
      {
        id: 'crm', label: 'CRM', desc: 'Leads, pipeline, qualification and timelines.', icon: Users,
        status: 'live', href: '/zorixza/crm', phase: 'P6', plannedPages: [], reuse: ['crm/* APIs', 'customers', 'record_links'],
      },
      {
        id: 'sales', label: 'Sales', desc: 'Quotations → orders → waybills → delivery → invoice.', icon: ShoppingCart,
        status: 'preview', href: '/zorixza/sales', phase: 'P8',
        plannedPages: [
          'Quotations — numbered quotes with items, tax, validity, approval, PDF',
          'Sales Orders — stock reservation, warehouse, fulfilment status',
          'Waybills — create/upload/scan with OCR review-before-post',
          'Deliveries — dispatch, delivery confirmation, returns linkage',
          'Returns & Credit Notes — restock rules and AR adjustment',
          'Invoices & Receipts — numbering, allocation, payment recording',
          'Commissions & Targets — salesperson performance and payout',
          'Sales Reports — by branch, person, product and customer',
        ],
        reuse: ['customers', 'products', 'receipts', 'inventory/* (reservation link)'],
      },
      {
        id: 'invoicing', label: 'Invoicing', desc: 'Draft, send, collect and age every invoice with receipts.', icon: ReceiptText,
        status: 'preview', href: '/zorixza/invoicing', phase: 'P8',
        plannedPages: [
          'Invoices — numbered documents with tax, discount, due dates, PDF',
          'Send & Reminders — email/WhatsApp delivery with read tracking',
          'Record Payment — cash/transfer/card with invoice allocation',
          'Credit Notes — adjustments that reduce AR with approval',
          'Ageing & Statements — 30/60/90/120+ buckets per customer',
        ],
        reuse: ['customers', 'receipts', 'customer_payments (011, pending)'],
      },
      {
        id: 'pos', label: 'Point of Sale', desc: 'Counter sales with barcode scan, cash drawer and receipts.', icon: ShoppingBag,
        status: 'preview', href: '/zorixza/pos', phase: 'P8',
        plannedPages: [
          'Sell Screen — barcode/QR scan, quantities, discounts, totals',
          'Cash Drawer — open/close floats with shift reconciliation',
          'Receipts — instant customer receipts linked to stock issue',
          'End-of-Day — sales by cashier, method and category',
        ],
        reuse: ['products', 'warehouse_stock', 'inventory_movements'],
      },
      {
        id: 'marketing', label: 'Marketing', desc: 'Content, social, campaigns and ads — Marketing workspace.', icon: Megaphone,
        status: 'live', href: '/dashboard', phase: 'P6', plannedPages: [], reuse: ['Marketing shell (/dashboard)'],
      },
      {
        id: 'communication', label: 'Communication', desc: 'Unified email, SMS, notifications, templates and delivery history.', icon: Map,
        status: 'preview', href: '/zorixza/communication', phase: 'P21',
        plannedPages: [
          'Unified inbox — email/SMS/WhatsApp threads per customer',
          'Campaigns — segments, scheduling, delivery and bounce tracking',
          'Templates — personalised message templates with approval',
          'Delivery reports — sent/delivered/read/failed per channel',
          'Opt-outs & consent — suppression list with audit trail',
        ],
        reuse: ['whatsapp/* (live inbox)', 'sendgrid/twilio libs', 'campaigns/*', 'email_templates'],
      },
    ],
  },
  {
    label: 'Operations',
    workspaces: [
      {
        id: 'inventory', label: 'Inventory', desc: 'Stock lines, warehouses and reorder control.', icon: Warehouse,
        status: 'live', href: '/zorixza/inventory', phase: 'P7', plannedPages: [], reuse: ['inventory/*', 'warehouses', 'inventory_movements'],
      },
      {
        id: 'products', label: 'Products', desc: 'Catalogue, SKUs, categories and price lists.', icon: Package,
        status: 'preview', href: '/zorixza/products', phase: 'P7/P20',
        plannedPages: [
          'All Products — master with SKU, barcode, images, specs',
          'Categories & Brands — taxonomy shared by sales and purchasing',
          'Variants & Units — alternate units, conversions, serials/batches',
          'Price Lists — base, customer-specific and currency pricing',
          'Serials & Batches — traceability from receipt to sale',
          'Import/Export — mapped CSV/Excel with validation and rollback',
        ],
        reuse: ['products/* APIs', 'product_sources'],
      },
      {
        id: 'purchasing', label: 'Purchasing', desc: 'Suppliers, purchase orders, goods receipts and bills.', icon: ClipboardList,
        status: 'live', href: '/zorixza/purchasing', phase: 'P9', plannedPages: [], reuse: ['directory/suppliers', 'inventory/purchase-orders', 'inventory/goods-receipts'],
      },
      {
        id: 'operations', label: 'Field Operations', desc: 'Tasks, custody, approvals and alert queue.', icon: ClipboardList,
        status: 'live', href: '/zorixza/operations', phase: 'P17', plannedPages: [], reuse: ['operations/*', 'approvals'],
      },
      {
        id: 'documents', label: 'Documents', desc: 'Receipt custody chain and verification.', icon: FolderOpen,
        status: 'live', href: '/zorixza/documents', phase: 'P16', plannedPages: [], reuse: ['documents/receipts', 'cloud_files', 'approvals (document inbox)'],
      },
      {
        id: 'projects', label: 'Projects', desc: 'Projects, milestones, tasks, budgets and progress.', icon: Briefcase,
        status: 'live', href: '/zorixza/projects', phase: 'P18', plannedPages: [], reuse: ['work/schedules (project scope)', 'record_links', 'records/timeline'],
      },
      {
        id: 'field', label: 'Field Service', desc: 'Jobs, dispatch, schedules, checklists and completion.', icon: Wrench,
        status: 'live', href: '/zorixza/field', phase: 'P18', plannedPages: [], reuse: ['work/schedules (field scope)', 'operations/*'],
      },
      {
        id: 'installation', label: 'Installation', desc: 'CCTV, access, marine and ICT install teams and jobs.', icon: HardHat,
        status: 'preview', href: '/zorixza/installation', phase: 'P19',
        plannedPages: [
          'Install Jobs — site, crew, equipment and stage tracking',
          'Crews — team rosters, skills and availability',
          'Equipment & Tools — checkout/return against each job',
          'Site Photos — before/after evidence attached to the job',
          'Customer Sign-off — completion certificate and signature',
        ],
        reuse: ['work/schedules (installation scope)'],
      },
      {
        id: 'support', label: 'Support', desc: 'Tickets, SLA, assignment and satisfaction.', icon: LifeBuoy,
        status: 'preview', href: '/zorixza/support', phase: 'P20',
        plannedPages: [
          'Tickets — intake, categorisation and customer linkage',
          'SLA & Priorities — response/resolution clocks per plan',
          'Assignment — queues, ownership and escalation',
          'Resolution — knowledge-base answers and fix records',
          'Satisfaction — ratings and reopen loop',
        ],
        reuse: ['approvals', 'operations/notifications'],
      },
      {
        id: 'assets', label: 'Assets', desc: 'Equipment, vehicles, tools and office assets with custody.', icon: Archive,
        status: 'preview', href: '/zorixza/assets', phase: 'P18',
        plannedPages: [
          'Asset Register — serial, model, cost, location, status',
          'Assignment — custodian, department, project/job linkage',
          'Maintenance — schedules, service history and documents',
          'Depreciation & Disposal — books, transfers and write-off',
        ],
        reuse: [],
      },
      {
        id: 'tasks', label: 'Tasks & Calendar', desc: 'Universal tasks, team calendar and deadline tracking.', icon: ListTodo,
        status: 'preview', href: '/zorixza/tasks', phase: 'P17',
        plannedPages: [
          'My Tasks — due dates, priorities, checklists, dependencies',
          'Team Calendar — schedules, leave, interviews, deadlines',
          'Recurring Tasks — templates with reminders and ownership',
        ],
        reuse: ['work/schedules', 'approvals'],
      },
      {
        id: 'manufacturing', label: 'Manufacturing', desc: 'Bills of materials, work orders and production costing.', icon: Factory,
        status: 'preview', href: '/zorixza/manufacturing', phase: 'P18',
        plannedPages: [
          'Bills of Materials — components, quantities and wastage per product',
          'Work Orders — issue components, track labour, receive finished goods',
          'Production Costing — material + labour + overhead per batch',
          'Capacity — work-centre load and bottleneck view',
        ],
        reuse: ['products', 'inventory_movements'],
      },
      {
        id: 'fleet', label: 'Fleet & Transport', desc: 'Vehicles, drivers, trips, fuel and maintenance.', icon: Truck,
        status: 'preview', href: '/zorixza/fleet', phase: 'P18',
        plannedPages: [
          'Vehicles — registration, documents, insurance, assignment',
          'Trips — dispatch, routes, delivery linkage, mileage capture',
          'Fuel & Costs — consumption, fill records, cost per km',
          'Maintenance — service schedules, workshop history, downtime',
        ],
        reuse: ['work/schedules'],
      },
      {
        id: 'mileage', label: 'Mileage Tracking', desc: 'Staff travel log with approval and reimbursement.', icon: Gauge,
        status: 'preview', href: '/zorixza/mileage', phase: 'P18',
        plannedPages: [
          'Trip Log — start/end odometer, purpose, customer linkage',
          'Approval — line-manager review with policy rates',
          'Reimbursement — approved km converted to expense claims',
        ],
        reuse: ['approvals'],
      },
    ],
  },
  {
    label: 'Finance',
    workspaces: [
      {
        id: 'accounting', label: 'Accounting', desc: 'Chart of accounts, ledger, journals, AR/AP, banking, close.', icon: Calculator,
        status: 'preview', href: '/zorixza/accounting', phase: 'P10',
        plannedPages: [
          'Chart of Accounts — assets, liabilities, equity, income, COS, expenses with hierarchy',
          'General Ledger — every balance traceable to its source document',
          'Journals — manual, recurring, accruals, adjustments with DEBITS=CREDITS',
          'Trial Balance & Financial Reports — P&L, Balance Sheet, Cash Flow with drill-down',
          'Receivables — invoices, allocations, 30/60/90/120+ ageing, statements',
          'Payables — supplier bills, allocations, ageing, payment runs',
          'Banking & Reconciliation — imports, matching, duplicates, period approval',
          'Tax & Budgets — jurisdiction-configured tax plus budget-vs-actual',
          'Period Close — locked periods, year-end, audit trail',
        ],
        reuse: ['receipts (posting link)', 'inventory_movements (posting link)'],
      },
      {
        id: 'finance', label: 'Finance', desc: 'Cash flow, budgets, fixed assets and management pack.', icon: Wallet,
        status: 'preview', href: '/zorixza/finance', phase: 'P10',
        plannedPages: [
          'Cash Flow — actuals plus 13-week forecast',
          'Budgets vs Actual — departments, branches, cost centres, variance',
          'Fixed Assets — register, capitalisation, depreciation, disposal',
          'Management Pack — ratios, commentary and board-ready export',
        ],
        reuse: [],
      },
      {
        id: 'banking', label: 'Banking & Feeds', desc: 'Accounts, imports, matching and reconciliation.', icon: Landmark,
        status: 'preview', href: '/zorixza/banking', phase: 'P10',
        plannedPages: [
          'Bank Accounts — cash, bank and mobile-money with live balances',
          'Transactions — imports/feeds plus system postings, categorised',
          'Matching — full/partial match to invoices, bills and journals',
          'Reconciliation — period close with breaks, approval and audit trail',
        ],
        reuse: ['bank_accounts/bank_transactions (011, pending)'],
      },
      {
        id: 'expenses', label: 'Expenses', desc: 'Staff claims and overheads with approval and posting.', icon: Coins,
        status: 'preview', href: '/zorixza/expenses', phase: 'P10',
        plannedPages: [
          'Expense Claims — receipts, categories, project tagging',
          'Approval — policy limits with manager/finance chain',
          'Overheads — rent, utilities, subscriptions scheduled and posted',
          'Reimbursement — approved claims paid and journal-posted',
        ],
        reuse: ['approvals', 'receipts', 'supplier_bills (011, pending)'],
      },
      {
        id: 'fixed-assets', label: 'Fixed Assets', desc: 'Register, depreciation, transfers and disposal.', icon: Boxes,
        status: 'preview', href: '/zorixza/fixed-assets', phase: 'P10',
        plannedPages: [
          'Asset Register — cost, location, custodian, warranty, documents',
          'Depreciation — straight-line/reducing schedules posted to GL',
          'Transfers — branch/custodian moves with audit trail',
          'Disposal — sale/write-off with gain/loss computation',
        ],
        reuse: [],
      },
      {
        id: 'budgets', label: 'Budgets & Forecasts', desc: 'Plans, variance analysis and cash forecasting.', icon: Target,
        status: 'preview', href: '/zorixza/budgets', phase: 'P10',
        plannedPages: [
          'Budgets — by account, department, branch and period',
          'Variance — actual-vs-budget with commentary workflow',
          'Forecasts — rolling revenue, cost and cash projections',
          'What-if — scenario copies that never touch live books',
        ],
        reuse: ['budgets (011, pending)'],
      },
      {
        id: 'loans', label: 'Loans', desc: 'Borrowings, schedules, repayments and interest.', icon: PiggyBank,
        status: 'preview', href: '/zorixza/loans', phase: 'P10',
        plannedPages: [
          'Loan Accounts — principal, rate, tenure, collateral records',
          'Repayment Schedules — amortisation with due-date alerts',
          'Repayments — postings split into principal vs interest',
          'Covenants — compliance dates and document reminders',
        ],
        reuse: ['approvals', 'operations/notifications'],
      },
      {
        id: 'tax', label: 'Tax & E-Filing', desc: 'Jurisdiction-configured tax computation and returns.', icon: FileText,
        status: 'preview', href: '/zorixza/tax', phase: 'P10',
        plannedPages: [
          'Tax Profiles — VAT/WHT/PAYE rules per jurisdiction',
          'Computation — tax on sales, purchases and payroll drafts',
          'Returns — filing-ready schedules with supporting ledgers',
          'Filings — submission log, receipts and deadline alerts',
        ],
        reuse: [],
      },
      {
        id: 'auditiq', label: 'AuditIQ', desc: 'Engagements, working papers, tests, findings and sign-off.', icon: ScanSearch,
        status: 'preview', href: '/zorixza/auditiq', phase: 'P11',
        plannedPages: [
          'Clients & Engagements — scoped audit jobs with teams',
          'Planning — materiality, risk areas and timetables',
          'Working Papers — reviewer comments and evidence links',
          'Reconciliation — ledger-to-bank matching with breaks',
          'Audit Tests — duplicates, gaps, anomalies with confidence scores',
          'Findings & Evidence — management points with sign-off trail',
          'Review & Sign-off — partner review and report generation',
        ],
        reuse: ['documents/receipts (evidence)', 'cloud_files'],
      },
    ],
  },
  {
    label: 'People',
    workspaces: [
      {
        id: 'hr', label: 'HR', desc: 'Staff directory, departments, documents and cases.', icon: HeartHandshake,
        status: 'live', href: '/zorixza/hr', phase: 'P12', plannedPages: [], reuse: ['hr/staff-directory', 'business_members', 'admin/staff'],
      },
      {
        id: 'recruitment', label: 'Recruitment', desc: 'Requisitions, candidates, interviews, offers and analytics.', icon: UserPlus,
        status: 'preview', href: '/zorixza/recruitment', phase: 'P13',
        plannedPages: [
          'Requisitions — headcount requests with approval chain',
          'Openings — public/internal adverts with screening questions',
          'Candidates — pipeline, CVs, notes and interview scores',
          'Interviews — panels, calendars and structured feedback',
          'Offers — letters, acceptance and onboarding handoff',
          'Pipeline Analytics — time-to-hire and source effectiveness',
        ],
        reuse: ['approvals'],
      },
      {
        id: 'attendance', label: 'Attendance & Leave', desc: 'Shifts, device events, leave balances and approvals.', icon: CalendarCheck,
        status: 'preview', href: '/zorixza/attendance', phase: 'P14',
        plannedPages: [
          'Attendance — shifts vs device/CSV imports with exceptions',
          'Shifts — rosters, rotations and overtime rules',
          'Leave Types & Balances — accruals per policy',
          'Leave Requests — apply → approve → payroll linkage',
          'Calendars — holidays, team availability, coverage',
        ],
        reuse: ['approvals'],
      },
      {
        id: 'payroll', label: 'Payroll', desc: 'Salaries, allowances, deductions, tax, pension and payslips.', icon: Banknote,
        status: 'preview', href: '/zorixza/payroll', phase: 'P15',
        plannedPages: [
          'Pay Runs — period runs with approval before posting',
          'Allowances & Deductions — jurisdiction-configured components',
          'Tax & Pension — statutory computation and filings',
          'Payslips — branded slips with distribution log',
          'Payroll Reports — cost by department, GL posting summary',
        ],
        reuse: [],
      },
    ],
  },
  {
    label: 'Industry',
    workspaces: [
      {
        id: 'construction', label: 'Construction', desc: 'BoQs, site progress, valuations and subcontractors.', icon: Building2,
        status: 'preview', href: '/zorixza/construction', phase: 'P18',
        plannedPages: [
          'BoQs — bill items, quantities, rates and variations',
          'Site Progress — daily diaries, photos and percent-complete',
          'Valuations — interim certificates linked to invoices',
          'Subcontractors — agreements, measurements and payments',
        ],
        reuse: ['work/schedules', 'cloud_files'],
      },
      {
        id: 'school', label: 'School Module', desc: 'Students, fees, classes, attendance and results.', icon: GraduationCap,
        status: 'preview', href: '/zorixza/school', phase: 'P18',
        plannedPages: [
          'Students — admission, guardians, class placement, documents',
          'Fees — billing per term, discounts, receipts, defaulters',
          'Attendance — class registers with absence alerts',
          'Results — assessments, report cards and transcripts',
        ],
        reuse: ['customers', 'receipts', 'operations/notifications'],
      },
      {
        id: 'property', label: 'Property', desc: 'Units, tenants, leases, rent and maintenance.', icon: Building,
        status: 'preview', href: '/zorixza/property', phase: 'P18',
        plannedPages: [
          'Units — blocks, flats, shops, occupancy and condition',
          'Tenants — KYC, lease terms, deposits and history',
          'Rent — billing cycles, receipts, arrears and reminders',
          'Maintenance — tickets, vendors and unit turnaround',
        ],
        reuse: ['customers', 'receipts', 'approvals'],
      },
      {
        id: 'healthcare', label: 'Healthcare', desc: 'Patients, visits, billing, pharmacy and lab.', icon: HeartPulse,
        status: 'preview', href: '/zorixza/healthcare', phase: 'P18',
        plannedPages: [
          'Patients — records, allergies, visits and consent',
          'Encounters — triage, consultation, prescriptions, referrals',
          'Billing — service tariffs, invoices, HMO claims, receipts',
          'Pharmacy & Lab — stock, dispensing, test orders and results',
        ],
        reuse: ['customers', 'products', 'warehouse_stock'],
      },
      {
        id: 'hospitality', label: 'Hospitality', desc: 'Reservations, front desk, housekeeping and billing.', icon: BedDouble,
        status: 'preview', href: '/zorixza/hospitality', phase: 'P18',
        plannedPages: [
          'Reservations — bookings, room allocation and no-show control',
          'Front Desk — check-in/out, folios and guest history',
          'Housekeeping — room status, tasks and inspections',
          'Billing — room, restaurant and bar charges on one folio',
        ],
        reuse: ['customers', 'receipts', 'work/schedules'],
      },
      {
        id: 'ngo', label: 'NGO / Funds', desc: 'Grants, beneficiaries, disbursements and donor reports.', icon: Sprout,
        status: 'preview', href: '/zorixza/ngo', phase: 'P18',
        plannedPages: [
          'Grants — awards, budgets, tranches and conditions',
          'Beneficiaries — registration, eligibility and case files',
          'Disbursements — approvals, payments and acknowledgement',
          'Donor Reports — utilisation, outcomes and audit-ready exports',
        ],
        reuse: ['customers', 'approvals', 'cloud_files'],
      },
    ],
  },
  {
    label: 'Platform',
    workspaces: [
      {
        id: 'ai', label: 'AI Assistant', desc: 'Ask questions, run commands, draft reports — permission-aware.', icon: Bot,
        status: 'preview', href: '/zorixza/ai', phase: 'P22',
        plannedPages: [
          'Assistant Chat — natural-language business commands with confirm/cancel',
          'Document Processing — upload → OCR → review → post pipeline',
          'Report Drafting — narrative summaries from real figures',
          'Anomaly Alerts — unusual transactions surfaced with evidence',
        ],
        reuse: ['claude/openrouter libs', 'content/generate'],
      },
      {
        id: 'automation', label: 'Automation', desc: 'Triggers, conditions, actions, logs and failure handling.', icon: Zap,
        status: 'preview', href: '/zorixza/automation', phase: 'P17',
        plannedPages: [
          'Rules — WHEN/IF/THEN builders (overdue, low stock, expiring docs)',
          'Runs & Logs — every execution with retry and failure state',
          'Templates — prebuilt flows per module with enable/disable',
        ],
        reuse: ['automation_rules', 'automation_triggers', 'automation/evaluate'],
      },
      {
        id: 'integrations', label: 'Integrations', desc: 'Providers, credentials, health, sync logs and mapping.', icon: Plug,
        status: 'preview', href: '/zorixza/integrations', phase: 'P26',
        plannedPages: [
          'Connected Apps — email, SMS, WhatsApp, banks, maps, AI, storage',
          'Credentials Vault — encrypted keys with test-connection',
          'Health & Logs — sync status, failures and retry queues',
          'Field Mapping — source-to-Zorixza mapping with previews',
        ],
        reuse: ['api_keys vault', 'webhooks/*'],
      },
      {
        id: 'portals', label: 'Portals', desc: 'Customer, vendor, employee and partner self-service access.', icon: Globe,
        status: 'preview', href: '/zorixza/portals', phase: 'P25',
        plannedPages: [
          'Customer Portal — quotes, orders, invoices, payments, jobs',
          'Vendor Portal — RFQs, POs, invoices, payment status',
          'Employee Portal — profile, leave, payslips, tasks',
          'Partner Portal — accountant/reseller client access',
        ],
        reuse: ['customers', 'suppliers', 'hr/staff-directory'],
      },
      {
        id: 'billing', label: 'Billing', desc: 'Zorixza plans, subscriptions, storage quotas and invoices.', icon: CreditCard,
        status: 'preview', href: '/zorixza/billing', phase: 'P31',
        plannedPages: [
          'Plans — tiers, limits and module entitlements',
          'Subscriptions — trials, renewals, upgrades, failed payments',
          'Usage & Quotas — storage, seats and API consumption',
          'Invoices — tenant billing documents and receipts',
        ],
        reuse: ['plans', 'subscriptions', 'storage_plans', 'storage/subscription', 'admin/storage'],
      },
      {
        id: 'admin', label: 'Administration', desc: 'Tenants, users, roles, plans, feature flags and audit logs.', icon: ShieldCheck,
        status: 'live', href: '/admin', phase: 'P3', plannedPages: [], reuse: ['Admin shell (/admin)'],
      },
    ],
  },
];

export const ALL_WORKSPACES = WORKSPACE_GROUPS.flatMap((g) =>
  g.workspaces.map((w) => ({ ...w, group: g.label }))
);

export function findWorkspace(id: string) {
  return ALL_WORKSPACES.find((w) => w.id === id) ?? null;
}

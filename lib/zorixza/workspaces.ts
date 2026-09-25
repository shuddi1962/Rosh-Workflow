// Zorixza Enterprise — workspace registry (single source of truth).
// Rule (§115/§116): status 'live' ONLY when DB → API → UI → audit works on
// real data. Everything else is 'build' and routes to the roadmap view with
// honest phase tracking — never a fake dashboard.

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
  type LucideIcon,
} from 'lucide-react';

export type WorkspaceStatus = 'live' | 'build';

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

const roadmap = (id: string) => `/zorixza/roadmap?module=${id}`;

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
        status: 'build', href: roadmap('analytics'), phase: 'P23',
        plannedPages: ['KPI dashboards', 'Revenue & expense trends', 'Inventory movement', 'Workforce analytics', 'Exports'],
        reuse: ['analytics/* APIs', 'Recharts'],
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
        status: 'build', href: roadmap('sales'), phase: 'P8',
        plannedPages: ['Quotations', 'Sales Orders', 'Waybills', 'Deliveries', 'Returns', 'Credit Notes', 'Commission', 'Sales Reports'],
        reuse: ['customers', 'products', 'receipts'],
      },
      {
        id: 'marketing', label: 'Marketing', desc: 'Content, social, campaigns and ads — Marketing workspace.', icon: Megaphone,
        status: 'live', href: '/dashboard', phase: 'P6', plannedPages: [], reuse: ['Marketing shell (/dashboard)'],
      },
      {
        id: 'communication', label: 'Communication', desc: 'Unified email, SMS, notifications, templates and delivery history.', icon: Map,
        status: 'build', href: roadmap('communication'), phase: 'P21',
        plannedPages: ['Inbox', 'Campaigns', 'Templates', 'Delivery Reports', 'Opt-outs'],
        reuse: ['whatsapp/* (new 009)', 'sendgrid/twilio libs', 'campaigns/*'],
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
        status: 'build', href: roadmap('products'), phase: 'P7/P20',
        plannedPages: ['All Products', 'Categories & Brands', 'Variants & Units', 'Price Lists', 'Serials & Batches', 'Import/Export'],
        reuse: ['products/* APIs'],
      },
      {
        id: 'purchasing', label: 'Purchasing', desc: 'RFQ → quotes → purchase orders → goods receipt → bills.', icon: ClipboardList,
        status: 'build', href: roadmap('purchasing'), phase: 'P9',
        plannedPages: ['Suppliers', 'RFQ', 'Supplier Quotes', 'Purchase Orders', 'Goods Receipts', 'Supplier Bills', 'Landed Costs'],
        reuse: ['suppliers', 'purchase_orders', 'goods_receipts'],
      },
      {
        id: 'operations', label: 'Field Operations', desc: 'Tasks, custody, approvals and alert queue.', icon: ClipboardList,
        status: 'live', href: '/zorixza/operations', phase: 'P17', plannedPages: [], reuse: ['operations/*', 'approvals'],
      },
      {
        id: 'documents', label: 'Documents', desc: 'Receipt custody chain and verification.', icon: FolderOpen,
        status: 'live', href: '/zorixza/documents', phase: 'P16', plannedPages: [], reuse: ['documents/receipts', 'cloud_files'],
      },
      {
        id: 'projects', label: 'Projects', desc: 'Projects, milestones, tasks, budgets and progress.', icon: Briefcase,
        status: 'build', href: roadmap('projects'), phase: 'P18',
        plannedPages: ['Projects', 'Milestones', 'Timeline', 'Budgets & Expenses', 'Project Reports'],
        reuse: ['work_schedules', 'tasks pattern'],
      },
      {
        id: 'field', label: 'Field Service', desc: 'Jobs, dispatch, GPS, checklists, photos and sign-off.', icon: Wrench,
        status: 'build', href: roadmap('field'), phase: 'P18',
        plannedPages: ['Jobs & Calendar', 'Dispatch', 'Technicians & Teams', 'Checklists & Materials', 'GPS & Photos', 'Completion'],
        reuse: ['work_schedules'],
      },
      {
        id: 'installation', label: 'Installation', desc: 'CCTV, access, marine and ICT install teams and jobs.', icon: HardHat,
        status: 'build', href: roadmap('installation'), phase: 'P19',
        plannedPages: ['Install Jobs', 'Crews', 'Equipment & Tools', 'Site Photos', 'Customer Sign-off'],
        reuse: ['work_schedules'],
      },
      {
        id: 'support', label: 'Support', desc: 'Tickets, SLA, assignment and satisfaction.', icon: LifeBuoy,
        status: 'build', href: roadmap('support'), phase: 'P20',
        plannedPages: ['Tickets', 'SLA & Priorities', 'Assignment', 'Resolution', 'Satisfaction'],
        reuse: ['approvals', 'notifications'],
      },
    ],
  },
  {
    label: 'Finance',
    workspaces: [
      {
        id: 'accounting', label: 'Accounting', desc: 'Chart of accounts, ledger, journals, AR/AP, banking, close.', icon: Calculator,
        status: 'build', href: roadmap('accounting'), phase: 'P10',
        plannedPages: ['Chart of Accounts', 'General Ledger', 'Journals', 'Trial Balance', 'Receivables', 'Payables', 'Banking & Reconciliation', 'Tax & Budgets', 'Period Close'],
        reuse: ['receipts', 'inventory_movements (posting link)'],
      },
      {
        id: 'finance', label: 'Finance', desc: 'Cash flow, budgets, fixed assets and management pack.', icon: Wallet,
        status: 'build', href: roadmap('finance'), phase: 'P10',
        plannedPages: ['Cash Flow', 'Budgets vs Actual', 'Fixed Assets', 'Management Pack'],
        reuse: [],
      },
      {
        id: 'auditiq', label: 'AuditIQ', desc: 'Engagements, working papers, tests, findings and sign-off.', icon: ScanSearch,
        status: 'build', href: roadmap('auditiq'), phase: 'P11',
        plannedPages: ['Clients & Engagements', 'Planning', 'Working Papers', 'Reconciliation', 'Audit Tests', 'Findings & Evidence', 'Review & Sign-off'],
        reuse: ['documents/receipts (evidence)'],
      },
    ],
  },
  {
    label: 'People',
    workspaces: [
      {
        id: 'hr', label: 'HR', desc: 'Employees, departments, documents, benefits and cases.', icon: HeartHandshake,
        status: 'build', href: roadmap('hr'), phase: 'P12',
        plannedPages: ['Employees', 'Departments & Positions', 'Documents', 'Benefits', 'Disciplinary', 'HR Reports'],
        reuse: ['business_members'],
      },
      {
        id: 'recruitment', label: 'Recruitment', desc: 'Requisitions, candidates, interviews, offers and analytics.', icon: UserPlus,
        status: 'build', href: roadmap('recruitment'), phase: 'P13',
        plannedPages: ['Requisitions', 'Openings', 'Candidates', 'Interviews', 'Offers', 'Pipeline Analytics'],
        reuse: [],
      },
      {
        id: 'attendance', label: 'Attendance & Leave', desc: 'Shifts, device events, leave balances and approvals.', icon: CalendarCheck,
        status: 'build', href: roadmap('attendance'), phase: 'P14',
        plannedPages: ['Attendance', 'Shifts', 'Leave Types & Balances', 'Leave Requests', 'Calendars'],
        reuse: ['approvals'],
      },
      {
        id: 'payroll', label: 'Payroll', desc: 'Salaries, allowances, deductions, tax, pension and payslips.', icon: Banknote,
        status: 'build', href: roadmap('payroll'), phase: 'P15',
        plannedPages: ['Pay Runs', 'Allowances & Deductions', 'Tax & Pension', 'Payslips', 'Payroll Reports'],
        reuse: [],
      },
    ],
  },
  {
    label: 'Platform',
    workspaces: [
      {
        id: 'ai', label: 'AI Assistant', desc: 'Ask questions, run commands, draft reports — permission-aware.', icon: Bot,
        status: 'build', href: roadmap('ai'), phase: 'P22',
        plannedPages: ['Assistant Chat', 'Natural-language Commands', 'Report Drafting', 'Anomaly Alerts'],
        reuse: ['claude/openrouter libs'],
      },
      {
        id: 'integrations', label: 'Integrations', desc: 'Providers, credentials, health, sync logs and mapping.', icon: Plug,
        status: 'build', href: roadmap('integrations'), phase: 'P26',
        plannedPages: ['Connected Apps', 'Credentials Vault', 'Health & Logs', 'Field Mapping'],
        reuse: ['api_keys vault', 'webhooks/*'],
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

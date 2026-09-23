export type MovementType =
  | 'received'
  | 'issued'
  | 'sold'
  | 'transferred'
  | 'returned'
  | 'adjustment'
  | 'damaged'
  | 'lost'
  | 'opening_balance'

export type TransferStatus =
  | 'draft'
  | 'requested'
  | 'approved'
  | 'in_transit'
  | 'received'
  | 'cancelled'

export type ReceiptStatus =
  | 'received'
  | 'with_me'
  | 'scanned'
  | 'pending_submission'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'archived'

export type ScheduleStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'
  | 'on_hold'

export type DailyReportStatus =
  | 'draft'
  | 'submitted'
  | 'reviewed'
  | 'approved'
  | 'returned'

export interface Warehouse {
  id: string
  code: string
  name: string
  location_type: string
  address: string
  manager_user_id: string
  is_active: boolean
  created_at: string
}

export interface WarehouseStock {
  id: string
  product_id: string
  warehouse_id: string
  quantity: number
  updated_at: string
}

export interface InventoryMovement {
  id: string
  reference_number: string
  movement_type: MovementType
  product_id: string
  warehouse_id: string | null
  quantity: number
  previous_quantity: number
  new_quantity: number
  source_destination: string
  person_responsible: string
  reason: string
  related_document_type: string
  related_document_id: string
  notes: string
  attachment_url: string | null
  created_by: string
  created_at: string
}

export interface StockTransfer {
  id: string
  transfer_number: string
  transfer_date: string
  source_warehouse_id: string
  destination_warehouse_id: string
  items: Array<{ product_id: string; quantity: number }>
  requested_by: string
  approved_by: string
  dispatched_by: string
  received_by: string
  status: TransferStatus
  notes: string
  created_by: string
  created_at: string
}

export interface GoodsReceipt {
  id: string
  grn_number: string
  purchase_order_id: string | null
  purchase_order_ref: string
  supplier: string
  delivery_date: string | null
  received_date: string
  warehouse_id: string | null
  received_by: string
  verification_status: string
  notes: string
  attachments: Array<{ name: string; url: string }>
  stock_posted: boolean
  created_by: string
  created_at: string
}

export interface CustodyReceipt {
  id: string
  receipt_code: string
  receipt_number: string
  document_type: string
  transaction_date: string | null
  date_received: string
  supplier_vendor: string
  customer_name: string
  department: string
  project: string
  location: string
  amount_naira: number
  currency: string
  payment_method: string
  expense_category: string
  purchase_reference: string
  purchase_order_ref: string
  goods_receipt_ref: string
  received_by: string
  current_holder: string
  physical_original_available: boolean
  digital_copy_available: boolean
  physical_storage_location: string
  filing_reference: string
  submitted_to: string
  submission_date: string | null
  verified_by: string
  approved_by: string
  status: ReceiptStatus
  attachment_url: string | null
  notes: string
  is_archived: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface WorkSchedule {
  id: string
  task_title: string
  description: string
  assigned_to: string
  assigned_to_name: string
  assigned_by: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: ScheduleStatus
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  related_module: string
  related_project: string
  progress_notes: string
  attachment_url: string | null
  created_at: string
  updated_at: string
}

export interface DailyReport {
  id: string
  report_date: string
  employee_id: string
  employee_name: string
  department: string
  status: DailyReportStatus
  summary: string
  challenges: string
  actions_taken: string
  achievements: string
  next_day_plan: string
  reviewed_by: string
  review_comment: string
  created_at: string
  updated_at: string
}

export interface DailyReportItem {
  id: string
  daily_report_id: string
  activity_time: string
  activity: string
  module: string
  description: string
  status: string
  result: string
  remarks: string
  source: 'auto' | 'manual'
  source_ref: string
  created_at: string
}

export const RECEIPT_STATUSES: ReceiptStatus[] = [
  'received',
  'with_me',
  'scanned',
  'pending_submission',
  'submitted',
  'under_review',
  'verified',
  'approved',
  'rejected',
  'returned',
  'archived',
]

export const MOVEMENT_TYPES: MovementType[] = [
  'received',
  'issued',
  'sold',
  'transferred',
  'returned',
  'adjustment',
  'damaged',
  'lost',
  'opening_balance',
]

export function generateReference(prefix: string): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${ymd}-${rand}`
}

export function naira(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '₦—'
  return `₦${Number(n).toLocaleString('en-NG')}`
}

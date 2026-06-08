// ── Users & permissions ──
export type Role = "manager" | "collaborator"

export type PermResource = "home" | "metrics" | "tasks" | "finance" | "clients"
export type PermAction = "view" | "create" | "edit" | "delete"

/** Per-resource action map for a collaborator. */
export type PermissionMap = Partial<
  Record<PermResource, Partial<Record<PermAction, boolean>>>
>

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: Role
  permissions: PermissionMap
  created_at: string
  updated_at: string
}

/** The current user's profile + resolved access, used across the UI. */
export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  permissions: PermissionMap
}

// ── Goals ──
export type GoalType = "numerical" | "symbolic"
export type GoalStatus = "active" | "completed" | "cancelled"

export interface Goal {
  id: string
  name: string
  description: string | null
  type: GoalType
  target_value: number | null
  current_value: number
  auto_source: "revenue" | null
  status: GoalStatus
  start_date: string
  target_date: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ── Projects ──
export type ProjectStatus = "active" | "archived"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  position: number
  created_at: string
  updated_at: string
}

// ── Columns ──
export interface Column {
  id: string
  project_id: string | null
  name: string
  position: number
  tasks?: Task[]
  created_at: string
  updated_at: string
}

// ── Tasks ──
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  id: string
  column_id: string
  title: string
  description: string | null
  priority: TaskPriority
  assignee_id: string | null
  assignee?: User
  due_date: string | null
  tags: string[]
  position: number
  created_at: string
  updated_at: string
}

// ── Clients ──
export type ClientStatus = "active" | "inactive"

export interface Client {
  id: string
  name: string
  contact: string | null
  notes: string | null
  status: ClientStatus
  created_at: string
  updated_at: string
}

// ── Services ──
export type ServiceStatus = "in_progress" | "completed" | "cancelled"

export interface Service {
  id: string
  client_id: string
  name: string
  types: string[]
  start_date: string | null
  end_date_estimated: string | null
  status: ServiceStatus
  created_at: string
  updated_at: string
}

// ── Service Payments ──
export type PaymentModality = "upfront" | "installment" | "post_delivery"

export interface ServicePayment {
  id: string
  service_id: string
  modality: PaymentModality
  total_amount: number
  installment_count: number
  first_payment_date: string | null
  installments?: PaymentInstallment[]
  created_at: string
  updated_at: string
}

// ── Payment Installments ──
export type InstallmentStatus = "pending" | "paid" | "overdue"

export interface PaymentInstallment {
  id: string
  service_payment_id: string
  amount: number
  due_date: string
  paid_at: string | null
  status: InstallmentStatus
  transaction_id: string | null
  created_at: string
  updated_at: string
}

// ── Transactions ──
export type TransactionType = "income" | "expense"
export type SourceType = "installment" | "manual" | "client_expense"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string | null
  competence_date: string
  source_type: SourceType | null
  source_id: string | null
  client_id: string | null
  created_at: string
  updated_at: string
}

// ── Contracts ──
export interface Contract {
  id: string
  client_id: string
  name: string
  file_path: string | null
  url: string | null
  created_at: string
  updated_at: string
}

// ── Pagination ──
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

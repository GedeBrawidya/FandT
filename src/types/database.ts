// =============================================================
// src/types/database.ts  –  Ruang Pribadi: hand-written DB types
// =============================================================

// ─── Shared base ─────────────────────────────────────────────
interface Base {
  id: string
  created_at: string
  updated_at: string
}

interface UserOwned extends Base {
  user_id: string
}

// =============================================================
// ROW TYPES
// =============================================================

export interface Profile extends UserOwned {
  display_name: string | null
  timezone: string
  period_start_day: number
  theme: string
}

export interface Wallet extends UserOwned {
  name: string
  type: 'cash' | 'bank' | 'ewallet'
  initial_balance: number
  is_archived: boolean
}

export interface Category extends UserOwned {
  kind: 'expense' | 'income' | 'task'
  name: string
  color: string
  icon: string
  sort_order: number
  is_archived: boolean
}

export interface Transaction extends UserOwned {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  wallet_id: string | null
  to_wallet_id: string | null
  category_id: string | null
  bill_id: string | null
  occurred_on: string        // ISO date string "YYYY-MM-DD"
  note: string | null
  deleted_at: string | null  // soft-delete
  // Relations populated by joins
  category?: Category | null
  wallet?: Wallet | null
  to_wallet?: Wallet | null
}

export interface Bill extends UserOwned {
  name: string
  amount: number
  due_day: number | null
  due_date: string | null    // ISO date string
  recurrence: 'none' | 'monthly'
  category_id: string | null
  is_active: boolean
}

export interface BillPayment extends Base {
  bill_id: string
  period_start: string       // ISO date string
  transaction_id: string | null
  paid_at: string            // ISO timestamptz string
}

export interface RecurringIncome extends UserOwned {
  name: string
  amount: number
  day_of_month: number
  wallet_id: string | null
  is_active: boolean
}

export interface BudgetPeriod extends UserOwned {
  start_date: string         // ISO date string
  end_date: string           // ISO date string
  savings_target: number
  note: string | null
}

export interface Task extends UserOwned {
  title: string
  notes: string | null
  type: 'task' | 'note'
  category_id: string | null
  priority: 'low' | 'med' | 'high'
  status: 'todo' | 'doing' | 'done'
  due_at: string | null      // ISO timestamptz string
  all_day: boolean
  completed_at: string | null
  recurrence_rule: string | null
  google_event_id: string | null
  sort_order: number
  deleted_at: string | null  // soft-delete
  // Relations populated by joins
  category?: Category | null
  subtasks?: Subtask[]
}

export interface Subtask extends Base {
  // No user_id – ownership is inherited from parent task
  task_id: string
  title: string
  is_done: boolean
  sort_order: number
}

export interface Event extends UserOwned {
  title: string
  description: string | null
  starts_at: string          // ISO timestamptz string
  ends_at: string            // ISO timestamptz string
  all_day: boolean
  google_event_id: string | null
}

export interface GoogleConnection extends UserOwned {
  google_email: string
  refresh_token_encrypted: string | null
  calendar_id: string | null
  status: string
  last_synced_at: string | null
}

export interface WishlistItem extends UserOwned {
  name: string
  image_path: string | null
  target_price: number
  url: string | null
  priority: number
  status: 'impian' | 'menabung' | 'tercapai'
  note: string | null
  achieved_at: string | null
}

export interface WishlistContribution extends Base {
  // No user_id – ownership is inherited from parent wishlist_item
  item_id: string
  amount: number
  contributed_on: string     // ISO date string
}

// =============================================================
// INSERT TYPES (omit auto-generated fields; optional fields optional)
// =============================================================

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  display_name?: string | null
}

export type WalletInsert = Omit<Wallet, 'id' | 'created_at' | 'updated_at'> & {
  initial_balance?: number
  is_archived?: boolean
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  color?: string
  icon?: string
  sort_order?: number
  is_archived?: boolean
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & {
  wallet_id?: string | null
  to_wallet_id?: string | null
  category_id?: string | null
  bill_id?: string | null
  note?: string | null
  deleted_at?: string | null
}

export type BillInsert = Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'due_date' | 'due_day' | 'category_id' | 'recurrence' | 'is_active'> & {
  due_day?: number | null
  due_date?: string | null
  recurrence?: 'none' | 'monthly'
  category_id?: string | null
  is_active?: boolean
}

export type BillPaymentInsert = Omit<BillPayment, 'id' | 'created_at' | 'updated_at'> & {
  transaction_id?: string | null
  paid_at?: string
}

export type RecurringIncomeInsert = Omit<RecurringIncome, 'id' | 'created_at' | 'updated_at'> & {
  wallet_id?: string | null
  is_active?: boolean
}

export type BudgetPeriodInsert = Omit<BudgetPeriod, 'id' | 'created_at' | 'updated_at'> & {
  savings_target?: number
  note?: string | null
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'> & {
  notes?: string | null
  type?: 'task' | 'note'
  category_id?: string | null
  priority?: 'low' | 'med' | 'high'
  status?: 'todo' | 'doing' | 'done'
  due_at?: string | null
  all_day?: boolean
  completed_at?: string | null
  recurrence_rule?: string | null
  google_event_id?: string | null
  sort_order?: number
  deleted_at?: string | null
}

export type SubtaskInsert = Omit<Subtask, 'id' | 'created_at' | 'updated_at'> & {
  is_done?: boolean
  sort_order?: number
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
  description?: string | null
  all_day?: boolean
  google_event_id?: string | null
}

export type GoogleConnectionInsert = Omit<GoogleConnection, 'id' | 'created_at' | 'updated_at'> & {
  refresh_token_encrypted?: string | null
  calendar_id?: string | null
  status?: string
  last_synced_at?: string | null
}

export type WishlistItemInsert = Omit<WishlistItem, 'id' | 'created_at' | 'updated_at'> & {
  image_path?: string | null
  url?: string | null
  priority?: number
  status?: 'impian' | 'menabung' | 'tercapai'
  note?: string | null
  achieved_at?: string | null
}

export type WishlistContributionInsert = Omit<WishlistContribution, 'id' | 'created_at' | 'updated_at'>

// Aliases for Insert<Entity>
export type InsertBill = BillInsert
export type InsertRecurringIncome = RecurringIncomeInsert
export type InsertWallet = WalletInsert
export type InsertCategory = CategoryInsert
export type InsertTransaction = TransactionInsert

// =============================================================
// RPC RETURN TYPES
// =============================================================

/** Returned by get_daily_allowance() */
export interface DailyAllowance {
  budget_variabel:   number  // total variable budget for the period
  sisa_budget:       number  // remaining variable budget (cumulative)
  sisa_hari:         number  // days remaining (including today)
  jatah_harian:      number  // daily allowance = sisa_budget / sisa_hari
  terpakai_hari_ini: number  // variable expense spent today
  sisa_hari_ini:     number  // jatah_harian - terpakai_hari_ini
  savings_target?:   number
  is_over_budget?:   boolean
  is_savings_at_risk?: boolean
  total_saldo?:      number
  is_safe?:          boolean
}

/** Returned by get_wallet_balances() */
export interface WalletBalance {
  id?:        string
  wallet_id: string
  name:      string
  type:      string
  balance:   number
}

/** Returned by get_spending_by_category() */
export interface SpendingByCategory {
  category_id: string
  name:        string
  color:       string
  total:       number
}

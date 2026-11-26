// =============================================================
// src/lib/mock-storage.ts  –  Full Local Storage Data Sync for Demo Mode
// =============================================================

import type { Task, Subtask, WishlistItem, BudgetPeriod, DailyAllowance, Wallet, Bill, Transaction, Category, WalletBalance, Event } from '@/types/database'
import { format, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns'
import { sortByDeadline } from '@/features/tasks/utils/task-groups'

export interface NoteDoc {
  id: string
  title: string
  content: string
  cover_url: string | null
  icon: string
  tag: string
  created_at: string
  updated_at: string
}

interface AppDataState {
  period: BudgetPeriod & { daily_cap: number }
  wallets: Wallet[]
  walletBalances: { wallet_id: string; wallet_name: string; balance: number }[]
  categories: Category[]
  transactions: Transaction[]
  bills: Bill[]
  tasks: Task[]
  wishlist: (WishlistItem & { contributions: { id: string; item_id: string; amount: number; contributed_on: string }[] })[]
  notes: NoteDoc[]
  events: Event[]
}

const STORAGE_KEY = 'ruang_app_data_v2'

function getInitialState(): AppDataState {
  const today = new Date()
  const now = today.toISOString()
  const startMonthStr = format(startOfMonth(today), 'yyyy-MM-dd')
  const endMonthStr = format(endOfMonth(today), 'yyyy-MM-dd')
  return {
    period: {
      id: 'demo-period-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      start_date: startMonthStr,
      end_date: endMonthStr,
      savings_target: 500000,
      daily_cap: 50000,
      note: `Active period ${format(today, 'MMMM yyyy')}`,
      created_at: now,
      updated_at: now,
    },
    wallets: [
      { id: 'w-kas', user_id: '00000000-0000-0000-0000-000000000001', name: 'Kas Fisik', type: 'cash', initial_balance: 1500000, is_archived: false, created_at: now, updated_at: now },
      { id: 'w-bca', user_id: '00000000-0000-0000-0000-000000000001', name: 'Rekening BCA', type: 'bank', initial_balance: 2000000, is_archived: false, created_at: now, updated_at: now },
      { id: 'w-gopay', user_id: '00000000-0000-0000-0000-000000000001', name: 'GoPay / OVO', type: 'ewallet', initial_balance: 500000, is_archived: false, created_at: now, updated_at: now },
    ],
    walletBalances: [
      { wallet_id: 'w-kas', wallet_name: 'Kas Fisik', balance: 1500000 },
      { wallet_id: 'w-bca', wallet_name: 'Rekening BCA', balance: 2000000 },
      { wallet_id: 'w-gopay', wallet_name: 'GoPay / OVO', balance: 500000 },
    ],
    categories: [
      { id: 'cat-makan', user_id: '00000000-0000-0000-0000-000000000001', kind: 'expense', name: 'Makan & Minum', color: '#f97316', icon: 'utensils', sort_order: 1, is_archived: false, created_at: now, updated_at: now },
      { id: 'cat-transport', user_id: '00000000-0000-0000-0000-000000000001', kind: 'expense', name: 'Transportasi', color: '#3b82f6', icon: 'bus', sort_order: 2, is_archived: false, created_at: now, updated_at: now },
      { id: 'cat-belanja', user_id: '00000000-0000-0000-0000-000000000001', kind: 'expense', name: 'Belanja Kebutuhan', color: '#10b981', icon: 'shopping-bag', sort_order: 3, is_archived: false, created_at: now, updated_at: now },
      { id: 'cat-hiburan', user_id: '00000000-0000-0000-0000-000000000001', kind: 'expense', name: 'Hiburan', color: '#ec4899', icon: 'film', sort_order: 4, is_archived: false, created_at: now, updated_at: now },
      { id: 'cat-task-pribadi', user_id: '00000000-0000-0000-0000-000000000001', kind: 'task', name: 'Pribadi', color: '#ec4899', icon: 'user', sort_order: 1, is_archived: false, created_at: now, updated_at: now },
      { id: 'cat-task-kerja', user_id: '00000000-0000-0000-0000-000000000001', kind: 'task', name: 'Pekerjaan', color: '#3b82f6', icon: 'briefcase', sort_order: 2, is_archived: false, created_at: now, updated_at: now },
    ],
    transactions: [
      { id: 'tx-1', user_id: '00000000-0000-0000-0000-000000000001', type: 'expense', amount: 35000, wallet_id: 'w-kas', to_wallet_id: null, category_id: 'cat-makan', bill_id: null, occurred_on: new Date().toISOString().split('T')[0], note: 'Makan Siang Nasi Padang', deleted_at: null, created_at: now, updated_at: now },
      { id: 'tx-2', user_id: '00000000-0000-0000-0000-000000000001', type: 'expense', amount: 18000, wallet_id: 'w-kas', to_wallet_id: null, category_id: 'cat-transport', bill_id: null, occurred_on: new Date().toISOString().split('T')[0], note: 'KRL & Ojek', deleted_at: null, created_at: now, updated_at: now },
    ],
    bills: [
      { id: 'bill-1', user_id: '00000000-0000-0000-0000-000000000001', name: 'Tagihan WiFi & Internet', amount: 350000, due_day: 25, due_date: '2026-11-25', recurrence: 'monthly', category_id: 'cat-belanja', is_active: true, created_at: now, updated_at: now },
      { id: 'bill-2', user_id: '00000000-0000-0000-0000-000000000001', name: 'Listrik PLN Pasca', amount: 200000, due_day: 28, due_date: '2026-11-28', recurrence: 'monthly', category_id: 'cat-belanja', is_active: true, created_at: now, updated_at: now },
    ],
    tasks: [
      {
        id: 'task-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Review Pengeluaran & Sisa Jatah Periode',
        notes: 'Cek transaksi seminggu terakhir dan sesuaikan target tabungan.',
        type: 'task',
        category_id: 'cat-task-pribadi',
        priority: 'high',
        status: 'todo',
        due_at: new Date(Date.now() + 3600000 * 3).toISOString(), // today
        all_day: false,
        completed_at: null,
        recurrence_rule: null,
        google_event_id: null,
        sort_order: 1,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        subtasks: [
          { id: 'st-1', task_id: 'task-1', title: 'Export mutasi ke CSV', is_done: true, sort_order: 0, created_at: now, updated_at: now },
          { id: 'st-2', task_id: 'task-1', title: 'Periksa tagihan PLN', is_done: false, sort_order: 1, created_at: now, updated_at: now },
        ],
      },
      {
        id: 'task-2',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Selesaikan Desain UI & Prototipe FandT',
        notes: 'Implementasikan Kanban board, kalender internal, dan wishlist.',
        type: 'task',
        category_id: 'cat-task-kerja',
        priority: 'med',
        status: 'doing',
        due_at: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        all_day: true,
        completed_at: null,
        recurrence_rule: null,
        google_event_id: null,
        sort_order: 2,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        subtasks: [
          { id: 'st-3', task_id: 'task-2', title: 'Kanban To Do, Doing, Done', is_done: true, sort_order: 0, created_at: now, updated_at: now },
          { id: 'st-4', task_id: 'task-2', title: 'Notion Keep Notes card', is_done: false, sort_order: 1, created_at: now, updated_at: now },
        ],
      },
      {
        id: 'task-3',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Bayar Tagihan WiFi Sebelum Jatuh Tempo',
        notes: 'Alokasikan dari dompet rekening bank.',
        type: 'task',
        category_id: 'cat-task-pribadi',
        priority: 'high',
        status: 'done',
        due_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        all_day: true,
        completed_at: now,
        recurrence_rule: null,
        google_event_id: null,
        sort_order: 3,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        subtasks: [],
      },
    ],
    wishlist: [
      {
        id: 'wish-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'MacBook Pro M4 14" Space Black',
        image_path: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        target_price: 28999000,
        url: 'https://apple.com/macbook-pro',
        priority: 5,
        status: 'menabung',
        note: 'Untuk upgrade perangkat development & multitasking harian.',
        achieved_at: null,
        created_at: now,
        updated_at: now,
        contributions: [{ id: 'c1', item_id: 'wish-1', amount: 8100000, contributed_on: '2026-11-20' }],
      },
      {
        id: 'wish-2',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Sony WH-1000XM5 Noise Cancelling',
        image_path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        target_price: 4999000,
        url: null,
        priority: 4,
        status: 'menabung',
        note: 'Fokus coding tanpa distraksi.',
        achieved_at: null,
        created_at: now,
        updated_at: now,
        contributions: [{ id: 'c2', item_id: 'wish-2', amount: 3500000, contributed_on: '2026-11-15' }],
      },
    ],
    notes: [
      {
        id: 'note-1',
        title: 'UTS Pemrograman Lanjut',
        content: `Entitas Sistem:\n1. tabel user\n2. tabel pesawat\n3. tabel jadwal\n4. tabel tarif\n5. tabel karyawan\n6. tabel pembayaran\n7. tabel data\n\nCatatan Penting:\n- Pastikan relasi foreign key cascade delete sudah diuji.\n- Endpoint auth JWT menggunakan middleware verifikasi.`,
        cover_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
        icon: '📝',
        tag: 'Kuliah',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'note-2',
        title: 'Itinerary Liburan Akhir Tahun di Bali',
        content: `Hari 1:\n- Check-in hotel Seminyak\n- Sunset chill di Pantai Batu Bolong Canggu\n- Dinner seafood di Jimbaran\n\nHari 2:\n- Snorkeling Nusa Penida (Manta Point)\n- Kelingking Beach photoshoot\n- Kembali ke Sanur jam 17:00\n\nBudget Est: Rp 4.500.000 / orang`,
        cover_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop&q=80',
        icon: '✈️',
        tag: 'Itinerary',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'note-3',
        title: 'Rencana Nabung & Upgrade Setup Kerja',
        content: `Target Kuartal 1 2027:\n1. MacBook Pro M4 (Target Rp 28.9jt)\n2. Ergonomic Chair Sihoo Doro C300\n3. Monitor 4K 27 inch Dell UltraSharp\n\nAturan: Baru boleh beli setelah tabungan melebihi 5x harga barang (safety net)!`,
        cover_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&auto=format&fit=crop&q=80',
        icon: '💻',
        tag: 'Rencana',
        created_at: now,
        updated_at: now,
      },
    ],
    events: [
      {
        id: 'event-demo-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Meeting Koordinasi Tim Proyek',
        description: 'Bahas integrasi API dan review sprint',
        starts_at: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00.000Z',
        ends_at: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T11:30:00.000Z',
        all_day: false,
        google_event_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'event-demo-2',
        user_id: '00000000-0000-0000-0000-000000000001',
        title: 'Evaluasi Portofolio Tabungan',
        description: 'Cek alokasi jatah harian dan wishlist 5x',
        starts_at: new Date().toISOString().split('T')[0] + 'T15:00:00.000Z',
        ends_at: new Date().toISOString().split('T')[0] + 'T16:00:00.000Z',
        all_day: false,
        google_event_id: null,
        created_at: now,
        updated_at: now,
      },
    ],
  }
}

export function loadAppState(): AppDataState {
  if (typeof window === 'undefined') return getInitialState()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const init = getInitialState()
    saveAppState(init)
    return init
  }
  try {
    const parsed = JSON.parse(raw) as AppDataState
    // Sanitize note-3 cover url if dark image was stored
    if (parsed.notes) {
      for (const n of parsed.notes) {
        if (n.id === 'note-3' && (!n.cover_url || n.cover_url.includes('1527443224154'))) {
          n.cover_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&auto=format&fit=crop&q=80'
        }
      }
    }
    if (!parsed.events) {
      parsed.events = getInitialState().events
    }
    // Migrate legacy hardcoded period dates to active month
    if (parsed.period && (parsed.period.start_date === '2026-11-25' || parsed.period.end_date === '2026-12-24')) {
      const today = new Date()
      parsed.period.start_date = format(startOfMonth(today), 'yyyy-MM-dd')
      parsed.period.end_date = format(endOfMonth(today), 'yyyy-MM-dd')
      parsed.period.note = `Active period ${format(today, 'MMMM yyyy')}`
      saveAppState(parsed)
    }
    return parsed
  } catch {
    const init = getInitialState()
    saveAppState(init)
    return init
  }
}

export function saveAppState(state: AppDataState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ─── Budget & Allowance ──────────────────────────────────────
export function getMockDailyAllowance(date: Date = new Date()): DailyAllowance {
  const state = loadAppState()
  const todayStr = date.toISOString().split('T')[0]

  const totalSaldo = state.walletBalances.reduce((sum, w) => sum + w.balance, 0)
  const savingsTarget = state.period.savings_target
  const unpaidBills = state.bills.filter((b) => b.is_active).reduce((sum, b) => sum + b.amount, 0)

  // Calculate real-time days remaining (inclusive of today)
  const endDate = new Date(state.period.end_date)
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endPeriod = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  const diffDays = differenceInCalendarDays(endPeriod, todayStart)
  const sisaHari = Math.max(1, diffDays + 1)

  // Formula Jatah Harian
  const budgetVariabel = Math.max(0, totalSaldo - savingsTarget - unpaidBills)
  const jatahHarian = Math.max(0, Math.floor(budgetVariabel / sisaHari))

  // Today's variable expenses
  const terpakaiHariIni = state.transactions
    .filter((t) => t.type === 'expense' && t.occurred_on === todayStr && !t.deleted_at && !t.bill_id)
    .reduce((sum, t) => sum + t.amount, 0)

  const dailyCap = state.period.daily_cap > 0 ? state.period.daily_cap : jatahHarian
  const sisaHariIni = dailyCap - terpakaiHariIni

  return {
    budget_variabel: budgetVariabel,
    jatah_harian: dailyCap,
    terpakai_hari_ini: terpakaiHariIni,
    sisa_hari_ini: sisaHariIni,
    total_saldo: totalSaldo,
    sisa_budget: budgetVariabel,
    sisa_hari: sisaHari,
    is_safe: sisaHariIni >= 0,
    is_over_budget: sisaHariIni < 0,
  }
}

export function getMockPeriod(): BudgetPeriod & { daily_cap: number } {
  const state = loadAppState()
  return state.period
}

export function updateMockSavingsTarget(amount: number): void {
  const state = loadAppState()
  state.period.savings_target = Math.max(0, amount)
  state.period.updated_at = new Date().toISOString()
  saveAppState(state)
}

export function updateMockDailyCap(amount: number): void {
  const state = loadAppState()
  state.period.daily_cap = Math.max(0, amount)
  state.period.updated_at = new Date().toISOString()
  saveAppState(state)
}

// ─── Wallets ────────────────────────────────────────────────
export function getMockWallets(): Wallet[] {
  const state = loadAppState()
  return state.wallets
}

export function getMockWalletBalances(): WalletBalance[] {
  const state = loadAppState()
  return state.walletBalances.map((wb) => {
    const wallet = state.wallets.find((w) => w.id === wb.wallet_id)
    return {
      wallet_id: wb.wallet_id,
      name: wallet?.name ?? wb.wallet_name,
      type: wallet?.type ?? 'cash',
      balance: wb.balance,
    }
  })
}

export function saveMockWallet(data: Partial<Wallet> & { name: string; type: Wallet['type']; initial_balance: number }): Wallet {
  const state = loadAppState()
  const now = new Date().toISOString()
  const index = state.wallets.findIndex((wallet) => wallet.id === data.id)
  if (index >= 0) {
    const previous = state.wallets[index]
    state.wallets[index] = { ...previous, ...data, updated_at: now }
    const balance = state.walletBalances.find((item) => item.wallet_id === previous.id)
    if (balance) balance.balance += data.initial_balance - previous.initial_balance
    saveAppState(state)
    return state.wallets[index]
  }
  const wallet: Wallet = { id: `wallet-${Date.now()}`, user_id: '00000000-0000-0000-0000-000000000001', name: data.name, type: data.type, initial_balance: data.initial_balance, is_archived: data.is_archived ?? false, created_at: now, updated_at: now }
  state.wallets.push(wallet)
  state.walletBalances.push({ wallet_id: wallet.id, wallet_name: wallet.name, balance: wallet.initial_balance })
  saveAppState(state)
  return wallet
}

export function archiveMockWallet(id: string): void {
  const state = loadAppState()
  const wallet = state.wallets.find((item) => item.id === id)
  if (wallet) { wallet.is_archived = true; wallet.updated_at = new Date().toISOString(); saveAppState(state) }
}

export const isUuid = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export function getMockCategories(kind?: 'expense' | 'income' | 'task'): Category[] {
  const state = loadAppState()
  return state.categories.filter((c) => !c.is_archived && (!kind || c.kind === kind))
}

export function saveMockCategory(data: Partial<Category> & { name: string; kind: Category['kind']; color: string; icon: string }): Category {
  const state = loadAppState()
  const now = new Date().toISOString()
  const index = state.categories.findIndex((c) => c.id === data.id)
  if (index >= 0) {
    state.categories[index] = { ...state.categories[index], ...data, updated_at: now }
    saveAppState(state)
    return state.categories[index]
  }
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    user_id: '00000000-0000-0000-0000-000000000001',
    name: data.name,
    kind: data.kind,
    color: data.color,
    icon: data.icon,
    sort_order: state.categories.length + 1,
    is_archived: false,
    created_at: now,
    updated_at: now,
  }
  state.categories.push(newCat)
  saveAppState(state)
  return newCat
}

export function archiveMockCategory(id: string): void {
  const state = loadAppState()
  const cat = state.categories.find((c) => c.id === id)
  if (cat) {
    cat.is_archived = true
    cat.updated_at = new Date().toISOString()
    saveAppState(state)
  }
}

// ─── Transactions ───────────────────────────────────────────
export function getMockTransactions(): Transaction[] {
  const state = loadAppState()
  return state.transactions
    .filter((tx) => !tx.deleted_at)
    .map((tx) => ({
      ...tx,
      category: state.categories.find((c) => c.id === tx.category_id) || null,
      wallet: state.wallets.find((w) => w.id === tx.wallet_id) || null,
    }))
}

export function addMockTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'deleted_at'>): Transaction {
  const state = loadAppState()
  const now = new Date().toISOString()
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}`,
    user_id: '00000000-0000-0000-0000-000000000001',
    deleted_at: null,
    created_at: now,
    updated_at: now,
  }

  // Update wallet balances
  if (tx.wallet_id) {
    const wb = state.walletBalances.find((w) => w.wallet_id === tx.wallet_id)
    if (wb) {
      if (tx.type === 'expense') wb.balance = Math.max(0, wb.balance - tx.amount)
      if (tx.type === 'income') wb.balance += tx.amount
    }
  }

  state.transactions.unshift(newTx)
  saveAppState(state)
  return {
    ...newTx,
    category: state.categories.find((c) => c.id === newTx.category_id) || null,
    wallet: state.wallets.find((w) => w.id === newTx.wallet_id) || null,
  }
}

export function updateMockTransaction(id: string, input: Partial<Transaction>): Transaction {
  const state = loadAppState()
  const now = new Date().toISOString()
  const index = state.transactions.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new Error('Transaksi tidak ditemukan')
  }
  const oldTx = state.transactions[index]
  const updatedTx: Transaction = {
    ...oldTx,
    ...input,
    updated_at: now,
  }
  // Adjust balance if amount or wallet changed
  if (oldTx.wallet_id && oldTx.amount !== updatedTx.amount) {
    const wb = state.walletBalances.find((w) => w.wallet_id === oldTx.wallet_id)
    if (wb) {
      if (oldTx.type === 'expense') {
        wb.balance += oldTx.amount - updatedTx.amount
      } else if (oldTx.type === 'income') {
        wb.balance += updatedTx.amount - oldTx.amount
      }
    }
  }
  state.transactions[index] = updatedTx
  saveAppState(state)
  return {
    ...updatedTx,
    category: state.categories.find((c) => c.id === updatedTx.category_id) || null,
    wallet: state.wallets.find((w) => w.id === updatedTx.wallet_id) || null,
  }
}

export function deleteMockTransaction(id: string): void {
  const state = loadAppState()
  const now = new Date().toISOString()
  const tx = state.transactions.find((t) => t.id === id)
  if (tx) {
    tx.deleted_at = now
    // Revert balance on delete
    if (tx.wallet_id) {
      const wb = state.walletBalances.find((w) => w.wallet_id === tx.wallet_id)
      if (wb) {
        if (tx.type === 'expense') wb.balance += tx.amount
        if (tx.type === 'income') wb.balance = Math.max(0, wb.balance - tx.amount)
      }
    }
    saveAppState(state)
  }
}

export function undoDeleteMockTransaction(id: string): void {
  const state = loadAppState()
  const tx = state.transactions.find((t) => t.id === id)
  if (tx) {
    tx.deleted_at = null
    // Re-apply balance
    if (tx.wallet_id) {
      const wb = state.walletBalances.find((w) => w.wallet_id === tx.wallet_id)
      if (wb) {
        if (tx.type === 'expense') wb.balance = Math.max(0, wb.balance - tx.amount)
        if (tx.type === 'income') wb.balance += tx.amount
      }
    }
    saveAppState(state)
  }
}

// ─── Tasks ──────────────────────────────────────────────────
export function getMockTasks(): Task[] {
  const state = loadAppState()
  const list = state.tasks.filter((t) => !t.deleted_at).map((t) => ({
    ...t,
    category: state.categories.find((c) => c.id === t.category_id) || null,
  }))
  return sortByDeadline(list)
}

export function saveMockTask(taskData: Partial<Task> & { title: string }): Task {
  const state = loadAppState()
  const now = new Date().toISOString()
  const existingIdx = state.tasks.findIndex((t) => t.id === taskData.id)

  if (existingIdx >= 0) {
    const updated = { ...state.tasks[existingIdx], ...taskData, updated_at: now }
    state.tasks[existingIdx] = updated
    saveAppState(state)
    return updated
  } else {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: taskData.title,
      notes: taskData.notes ?? null,
      type: 'task',
      category_id: taskData.category_id ?? null,
      priority: taskData.priority ?? 'med',
      status: taskData.status ?? 'todo',
      due_at: taskData.due_at ?? null,
      all_day: taskData.all_day ?? true,
      completed_at: taskData.status === 'done' ? now : null,
      recurrence_rule: null,
      google_event_id: null,
      sort_order: state.tasks.length + 1,
      deleted_at: null,
      created_at: now,
      updated_at: now,
      subtasks: taskData.subtasks ?? [],
    }
    state.tasks.unshift(newTask)
    saveAppState(state)
    return newTask
  }
}

export function updateMockTaskStatus(taskId: string, status: 'todo' | 'doing' | 'done'): Task | null {
  const state = loadAppState()
  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return null
  task.status = status
  task.completed_at = status === 'done' ? new Date().toISOString() : null
  task.updated_at = new Date().toISOString()
  saveAppState(state)
  return task
}

export function deleteMockTask(taskId: string): void {
  const state = loadAppState()
  state.tasks = state.tasks.filter((t) => t.id !== taskId)
  saveAppState(state)
}

export function saveMockSubtask(taskId: string, title: string): Subtask {
  const state = loadAppState()
  const task = state.tasks.find((item) => item.id === taskId)
  if (!task) throw new Error('Tugas tidak ditemukan')
  const now = new Date().toISOString()
  const subtask: Subtask = { id: `st-${Date.now()}`, task_id: taskId, title, is_done: false, sort_order: task.subtasks?.length ?? 0, created_at: now, updated_at: now }
  task.subtasks = [...(task.subtasks ?? []), subtask]
  task.updated_at = now
  saveAppState(state)
  return subtask
}

export function setMockSubtaskDone(id: string, isDone: boolean): Subtask {
  const state = loadAppState()
  for (const task of state.tasks) {
    const subtask = task.subtasks?.find((item) => item.id === id)
    if (subtask) {
      subtask.is_done = isDone
      subtask.updated_at = new Date().toISOString()
      saveAppState(state)
      return subtask
    }
  }
  throw new Error('Subtugas tidak ditemukan')
}

export function deleteMockSubtask(id: string): void {
  const state = loadAppState()
  for (const task of state.tasks) task.subtasks = task.subtasks?.filter((item) => item.id !== id) ?? []
  saveAppState(state)
}

// ─── Notes (Notion / Google Keep Docs) ──────────────────────
export function getMockNotes(): NoteDoc[] {
  const state = loadAppState()
  return state.notes || []
}

export function saveMockNote(data: Partial<NoteDoc> & { title: string; content: string }): NoteDoc {
  const state = loadAppState()
  const now = new Date().toISOString()
  const existingIdx = (state.notes || []).findIndex((n) => n.id === data.id)

  if (existingIdx >= 0) {
    const updated: NoteDoc = {
      ...state.notes[existingIdx],
      ...data,
      updated_at: now,
    }
    state.notes[existingIdx] = updated
    saveAppState(state)
    return updated
  } else {
    const newNote: NoteDoc = {
      id: `note-${Date.now()}`,
      title: data.title,
      content: data.content,
      cover_url: data.cover_url ?? null,
      icon: data.icon ?? '📝',
      tag: data.tag ?? 'Catatan',
      created_at: now,
      updated_at: now,
    }
    if (!state.notes) state.notes = []
    state.notes.unshift(newNote)
    saveAppState(state)
    return newNote
  }
}

export function deleteMockNote(noteId: string): void {
  const state = loadAppState()
  state.notes = (state.notes || []).filter((n) => n.id !== noteId)
  saveAppState(state)
}

// ─── Wishlist ───────────────────────────────────────────────
export function getMockWishlist() {
  const state = loadAppState()
  return state.wishlist || []
}

export function addMockWishlistContribution(itemId: string, amount: number) {
  const state = loadAppState()
  const item = state.wishlist.find((w) => w.id === itemId)
  if (item) {
    if (!item.contributions) item.contributions = []
    item.contributions.push({
      id: `c-${Date.now()}`,
      item_id: itemId,
      amount,
      contributed_on: new Date().toISOString().split('T')[0],
    })
    saveAppState(state)
  }
}

export function saveMockWishlistItem(data: Partial<WishlistItem> & { name: string; target_price: number }): WishlistItem {
  const state = loadAppState()
  const now = new Date().toISOString()
  const index = state.wishlist.findIndex((item) => item.id === data.id)
  if (index >= 0) {
    state.wishlist[index] = { ...state.wishlist[index], ...data, updated_at: now }
    saveAppState(state)
    return state.wishlist[index]
  }
  const item: WishlistItem & { contributions: { id: string; item_id: string; amount: number; contributed_on: string }[] } = {
    id: `wish-${Date.now()}`,
    user_id: '00000000-0000-0000-0000-000000000001',
    name: data.name,
    image_path: data.image_path ?? null,
    target_price: data.target_price,
    url: data.url ?? null,
    priority: data.priority ?? 3,
    status: data.status ?? 'impian',
    note: data.note ?? null,
    achieved_at: data.achieved_at ?? null,
    created_at: now,
    updated_at: now,
    contributions: [],
  }
  state.wishlist.unshift(item)
  saveAppState(state)
  return item
}

export function deleteMockWishlistItem(id: string): void {
  const state = loadAppState()
  state.wishlist = state.wishlist.filter((item) => item.id !== id)
  saveAppState(state)
}

// ─── Events (Calendar Agenda) ──────────────────────────────
export function getMockEvents(): Event[] {
  const state = loadAppState()
  return state.events || []
}

export function saveMockEvent(
  data: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Event {
  const state = loadAppState()
  const now = new Date().toISOString()
  const newEvent: Event = {
    id: `ev-${Date.now()}`,
    user_id: '00000000-0000-0000-0000-000000000001',
    title: data.title,
    description: data.description ?? null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    all_day: data.all_day ?? false,
    google_event_id: data.google_event_id ?? null,
    created_at: now,
    updated_at: now,
  }
  if (!state.events) state.events = []
  state.events.push(newEvent)
  saveAppState(state)
  return newEvent
}

export function deleteMockEvent(eventId: string): void {
  const state = loadAppState()
  state.events = (state.events || []).filter((e) => e.id !== eventId)
  saveAppState(state)
}

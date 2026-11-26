import { useState } from 'react'
import { TransactionList } from '@/features/finance/components/transaction-list'
import { TransactionForm } from '@/features/finance/components/transaction-form'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import { DateFilterPopover, type DateFilterValue } from '@/features/finance/components/date-filter-popover'
import { Plus, Zap } from 'lucide-react'
import { startOfDay, endOfDay } from 'date-fns'

export function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilterValue>(() => {
    const now = new Date()
    return {
      scope: 'day',
      date: now,
      start: startOfDay(now),
      end: endOfDay(now),
    }
  })

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Track income, expenses, and wallet transfers in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <DateFilterPopover value={dateFilter} onChange={setDateFilter} />
          <button
            onClick={() => setQuickAddOpen(true)}
            className="lisso-btn-secondary text-xs gap-1.5"
            title="Quick add with numpad"
          >
            <Zap size={14} className="text-amber-500" />
            <span>Quick Add</span>
          </button>
          <button
            onClick={() => setFormOpen(true)}
            className="lisso-btn-black text-xs gap-1.5"
          >
            <Plus size={15} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Transaction List with filters and grouped dates */}
      <TransactionList dateFilter={dateFilter} />

      {/* Forms */}
      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}

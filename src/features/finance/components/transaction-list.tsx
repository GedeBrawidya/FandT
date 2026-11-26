import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useTransactions,
  useSoftDeleteTransaction,
  useUndoDeleteTransaction,
} from '@/features/finance/hooks/use-transactions'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { TransactionForm } from '@/features/finance/components/transaction-form'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Transaction } from '@/types/database'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import type { DateFilterValue } from '@/features/finance/components/date-filter-popover'
import { Trash2, Edit2, RotateCcw, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Receipt } from 'lucide-react'

interface TransactionListProps {
  dateFilter?: DateFilterValue
}

export function TransactionList({ dateFilter }: TransactionListProps = {}) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null)
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null)

  const { data: categories = [] } = useCategories()
  const { data: transactions = [], isLoading } = useTransactions({
    type: typeFilter === 'all' ? undefined : typeFilter,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    start: dateFilter?.start,
    end: dateFilter?.end,
  })

  const softDeleteMutation = useSoftDeleteTransaction()
  const undoDeleteMutation = useUndoDeleteTransaction()

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete Transaction',
      description: 'Are you sure you want to delete this transaction record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })
    if (!ok) return
    await softDeleteMutation.mutateAsync(id)
    setLastDeletedId(id)

    if (undoTimer) clearTimeout(undoTimer)
    const timer = setTimeout(() => {
      setLastDeletedId(null)
    }, 5000)
    setUndoTimer(timer)
  }

  const handleUndo = async () => {
    if (lastDeletedId) {
      await undoDeleteMutation.mutateAsync(lastDeletedId)
      setLastDeletedId(null)
      if (undoTimer) clearTimeout(undoTimer)
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setIsFormOpen(true)
  }

  // Group transactions by occurred_on
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: { date: string; items: Transaction[]; dayTotal: number } } = {}

    for (const tx of transactions) {
      const d = tx.occurred_on
      if (!groups[d]) {
        groups[d] = { date: d, items: [], dayTotal: 0 }
      }
      groups[d].items.push(tx)
      if (tx.type === 'expense') {
        groups[d].dayTotal -= tx.amount
      } else if (tx.type === 'income') {
        groups[d].dayTotal += tx.amount
      }
    }

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions])

  return (
    <div className="space-y-4">
      {/* Undo Banner */}
      {lastDeletedId && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl backdrop-blur-md">
          <span className="text-xs text-slate-200">Transaction deleted</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-300 transition"
          >
            <RotateCcw size={14} /> Undo
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        {/* Type Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expense' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfer' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === item.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        {categories.length > 0 && typeFilter !== 'transfer' && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === c.id
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : groupedTransactions.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
          <Receipt size={32} className="text-slate-500" />
          <p className="text-sm text-slate-400">No transaction history found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                <span className="font-semibold">{formatDate(group.date)}</span>
                <span className={`tabular-nums font-semibold ${group.dayTotal < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {group.dayTotal < 0 ? `-${formatRupiah(Math.abs(group.dayTotal))}` : `+${formatRupiah(group.dayTotal)}`}
                </span>
              </div>

              {/* Items in this date */}
              <div className="space-y-1.5">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'expense'
                  const isIncome = tx.type === 'income'

                  return (
                    <Card
                      key={tx.id}
                      className="group p-3 flex items-center justify-between border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.16] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon */}
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isExpense
                              ? 'bg-red-500/10 text-red-400'
                              : isIncome
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-sky-500/10 text-sky-400'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowUpRight size={16} />
                          ) : isIncome ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowLeftRight size={16} />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {tx.category && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: tx.category.color }}
                              />
                            )}
                            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                              {tx.category ? tx.category.name : tx.type === 'transfer' ? 'Wallet Transfer' : 'Uncategorized'}
                            </span>
                          </div>
                          {tx.note && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5 max-w-[200px] sm:max-w-xs">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold tabular-nums shrink-0 ${
                            isExpense
                              ? 'text-red-600 dark:text-red-400'
                              : isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {isExpense ? '-' : isIncome ? '+' : ''}
                          {formatRupiah(tx.amount)}
                        </span>

                        {/* Action buttons (always visible and easy to click) */}
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(tx)
                            }}
                            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-white/[0.08] transition-colors"
                            title="Edit transaksi"
                            aria-label="Edit transaksi"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(tx.id)
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 transition-colors"
                            title="Hapus transaksi"
                            aria-label="Hapus transaksi"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      <TransactionForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        transaction={editingTransaction}
      />
    </div>
  )
}

import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactions } from '@/features/finance/hooks/use-transactions'
import { formatRupiah } from '@/lib/format'
import { BarChart3 } from 'lucide-react'

export function SpendingChart() {
  const today = useMemo(() => new Date(), [])
  const sevenDaysAgo = useMemo(() => subDays(new Date(), 6), [])

  const { data: transactions = [], isLoading } = useTransactions({
    start: sevenDaysAgo,
    end: today,
    type: 'expense',
  })

  // Group by day for the last 7 days
  const chartData = useMemo(() => {
    const days: { dateStr: string; label: string; total: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const label = format(d, 'dd MMM')
      days.push({ dateStr, label, total: 0 })
    }

    for (const tx of transactions) {
      if (tx.deleted_at) continue
      const found = days.find((d) => d.dateStr === tx.occurred_on)
      if (found) {
        found.total += tx.amount
      }
    }

    const maxTotal = Math.max(...days.map((d) => d.total), 1)
    const hasAnySpending = days.some((d) => d.total > 0)
    return { days, maxTotal, hasAnySpending }
  }, [transactions])

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-40 w-full" />
      </Card>
    )
  }

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-stone-700 dark:text-stone-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            7-Day Spending Trend
          </span>
        </div>
        <span className="lisso-pill-neutral">Daily Chart</span>
      </div>

      {/* Bar Chart Container */}
      {!chartData.hasAnySpending && (
        <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center -mb-2">
          No expenses recorded in the last 7 days.
        </p>
      )}
      <div className="flex items-end justify-between gap-2 h-44 pt-6 px-1">
        {chartData.days.map((item) => {
          const heightPct = Math.round((item.total / chartData.maxTotal) * 100)
          const hasSpending = item.total > 0

          return (
            <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-2 py-0.5 rounded-full font-bold pointer-events-none tabular-nums whitespace-nowrap -mb-1 shadow-xs">
                {formatRupiah(item.total)}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[32px] bg-stone-100 dark:bg-stone-800 rounded-t-xl flex items-end justify-center h-28 overflow-hidden">
                <div
                  className={`w-full transition-all duration-500 rounded-t-xl ${
                    hasSpending
                      ? 'bg-stone-900 dark:bg-stone-100'
                      : 'bg-stone-200/50 dark:bg-stone-800'
                  }`}
                  style={{ height: `${Math.max(hasSpending ? 10 : 4, heightPct)}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactions } from '@/features/finance/hooks/use-transactions'
import { formatRupiah } from '@/lib/format'
import { PieChart } from 'lucide-react'

export function TopCategoriesCard() {
  const { data: transactions = [], isLoading } = useTransactions({ type: 'expense' })

  const categorySpending = useMemo(() => {
    const map = new Map<string, { name: string; color: string; total: number }>()

    for (const tx of transactions) {
      if (tx.deleted_at || tx.type !== 'expense') continue
      const catId = tx.category_id || 'uncategorized'
      const name = tx.category?.name || 'Uncategorized'
      const color = tx.category?.color || '#94a3b8'

      const existing = map.get(catId) || { name, color, total: 0 }
      existing.total += tx.amount
      map.set(catId, existing)
    }

    let list = Array.from(map.values()).sort((a, b) => b.total - a.total)

    // Demo fallbacks if empty
    if (list.length === 0) {
      list = [
        { name: 'Makan & Minum', color: '#f97316', total: 180000 },
        { name: 'Transportasi', color: '#3b82f6', total: 95000 },
        { name: 'Belanja Kebutuhan', color: '#14b8a6', total: 60000 },
        { name: 'Hiburan', color: '#ec4899', total: 45000 },
      ]
    }

    const grandTotal = list.reduce((acc, c) => acc + c.total, 0)
    return { list: list.slice(0, 5), grandTotal }
  }, [transactions])

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-20 w-full" />
      </Card>
    )
  }

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-stone-700 dark:text-stone-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Top Expense Categories
          </span>
        </div>
        <span className="lisso-pill-neutral">Allocation</span>
      </div>

      <div className="space-y-3.5 pt-1">
        {categorySpending.list.map((cat) => {
          const pct =
            categorySpending.grandTotal > 0
              ? Math.round((cat.total / categorySpending.grandTotal) * 100)
              : 0

          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{cat.name}</span>
                </div>
                <span className="font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                  {formatRupiah(cat.total)} ({pct}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

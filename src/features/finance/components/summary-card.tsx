import { differenceInCalendarDays, endOfMonth } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletBalances } from '@/features/finance/hooks/use-wallets'
import { useDailyAllowance, useBudgetPeriod } from '@/features/finance/hooks/use-allowance'
import { formatRupiah } from '@/lib/format'

interface StatItemProps {
  label: string
  value: string
  sub?: string
  color?: string
}

function StatItem({ label, value, sub, color }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40">
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</span>
      <span className={`text-base sm:text-lg font-extrabold tracking-tight ${color ?? 'text-stone-900 dark:text-stone-100'}`}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-stone-400">{sub}</span>}
    </div>
  )
}

export function SummaryCard({ date = new Date() }: { date?: Date }) {
  const { data: walletBalances, isLoading: loadingBalances } = useWalletBalances()
  const { data: allowance, isLoading: loadingAllowance } = useDailyAllowance(date)
  const { data: period, isLoading: loadingPeriod } = useBudgetPeriod()

  const isLoading = loadingBalances || loadingAllowance || loadingPeriod

  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </Card>
    )
  }

  // Calculate sum of all wallet balances
  const totalBalance = (walletBalances ?? []).reduce((acc, w) => acc + (w.balance ?? 0), 0)
  const sisaBudget = allowance?.sisa_budget ?? 0
  const savingsTarget = period?.savings_target ?? allowance?.savings_target ?? 0
  const sisaHari = allowance?.sisa_hari ?? Math.max(1, differenceInCalendarDays(new Date(period?.end_date ?? endOfMonth(new Date())), new Date()) + 1)

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Financial Summary
        </span>
        <span className="lisso-pill-neutral">Active Period</span>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <StatItem
          label="Total Balance"
          value={formatRupiah(totalBalance)}
          sub="All wallets & accounts"
          color="text-stone-900 dark:text-stone-100"
        />
        <StatItem
          label="Remaining Budget"
          value={formatRupiah(sisaBudget)}
          sub="Variable budget"
          color={sisaBudget < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-stone-100'}
        />
        <StatItem
          label="Savings Target"
          value={formatRupiah(savingsTarget)}
          sub="This period"
          color="text-amber-600 dark:text-amber-400"
        />
        <StatItem
          label="Days Remaining"
          value={`${sisaHari} Days`}
          sub="Until period end"
        />
      </div>
    </Card>
  )
}

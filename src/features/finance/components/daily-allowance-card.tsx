import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDailyAllowance } from '@/features/finance/hooks/use-allowance'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Sparkles, ArrowRight } from 'lucide-react'

interface Props {
  date?: Date
  onSetupPeriod?: () => void
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800', className)} />
}

export function DailyAllowanceCard({ date = new Date(), onSetupPeriod }: Props) {
  const { data: allowance, isLoading, error } = useDailyAllowance(date)

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-14 w-48" />
        <SkeletonBlock className="h-3 w-full" />
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      </Card>
    )
  }

  // Fallback defaults for demo / first-time user
  const jatah_harian = allowance?.jatah_harian ?? 0
  const sisa_hari_ini = allowance?.sisa_hari_ini ?? 0
  const terpakai_hari_ini = allowance?.terpakai_hari_ini ?? 0
  const sisa_budget = allowance?.sisa_budget ?? 0
  const is_over_budget = allowance?.is_over_budget ?? (sisa_hari_ini < 0)
  const is_savings_at_risk = allowance?.is_savings_at_risk ?? (sisa_budget < 0)

  const pctUsed = jatah_harian > 0
    ? Math.min(100, Math.round(((jatah_harian - sisa_hari_ini) / jatah_harian) * 100))
    : (terpakai_hari_ini > 0 ? 100 : 0)

  const amountColor =
    sisa_hari_ini >= 0
      ? 'text-stone-900 dark:text-stone-100'
      : 'text-rose-600 dark:text-rose-400'

  const barColor =
    pctUsed < 70
      ? 'bg-stone-900 dark:bg-stone-100'
      : pctUsed < 90
      ? 'bg-amber-500'
      : 'bg-rose-500'

  return (
    <Card className="p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Today's Daily Allowance
        </span>
        <span className={sisa_hari_ini >= 0 ? 'lisso-pill-green' : 'lisso-pill-red'}>
          {sisa_hari_ini >= 0 ? 'Safe' : 'Over Budget'}
        </span>
      </div>

      <p className={cn('text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums', amountColor)}>
        {formatRupiah(jatah_harian)}
      </p>

      <Progress value={pctUsed} color={barColor} className="h-2.5 rounded-full" />

      <div className="flex justify-between text-xs font-semibold">
        <span className="text-stone-500 dark:text-stone-400">
          Spent: <span className="text-stone-800 dark:text-stone-200">{formatRupiah(terpakai_hari_ini)}</span>
        </span>
        <span className={amountColor}>
          Remaining Today: {formatRupiah(sisa_hari_ini)}
        </span>
      </div>

      {is_over_budget && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs text-rose-700 dark:text-rose-300">
          ⚠️ Exceeded today's allowance! Impact on tomorrow:{' '}
          <span className="font-bold">-{formatRupiah(Math.abs(sisa_hari_ini))}</span>
        </div>
      )}

      {is_savings_at_risk && !is_over_budget && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3.5 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Savings target at risk. Consider adjusting your target.
        </div>
      )}

      {!allowance && (
        <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400">Using default estimate</span>
          {onSetupPeriod && (
            <button
              onClick={onSetupPeriod}
              className="text-xs font-bold text-stone-900 dark:text-stone-100 hover:underline flex items-center gap-1"
            >
              <span>Set Period</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

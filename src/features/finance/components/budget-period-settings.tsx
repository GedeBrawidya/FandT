import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgetPeriod, useUpdateSavingsTarget } from '@/features/finance/hooks/use-allowance'
import { createOrEnsurePeriod } from '@/features/finance/api/budget-periods'
import { formatDate } from '@/lib/format'
import { Calendar, Target, CheckCircle2 } from 'lucide-react'

export function BudgetPeriodSettings() {
  const { data: period, isLoading, refetch } = useBudgetPeriod()
  const updateTargetMutation = useUpdateSavingsTarget()

  const [savingsTarget, setSavingsTarget] = useState<number>(0)
  const [periodStartDay, setPeriodStartDay] = useState<number>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    if (period) {
      setSavingsTarget(period.savings_target || 0)
    }
  }, [period])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg(false)
    try {
      if (period) {
        await updateTargetMutation.mutateAsync({
          periodId: period.id,
          amount: Number(savingsTarget) || 0,
        })
      } else {
        await createOrEnsurePeriod(periodStartDay)
        await refetch()
      }
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err) {
      console.error('Failed to update period settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="text-emerald-400" size={20} />
        <h2 className="text-base font-semibold text-slate-100">Pengaturan Periode & Budget</h2>
      </div>

      {/* Current Active Period Card */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
        <span className="text-xs text-slate-400 font-medium">Current Active Period</span>
        {period ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-100">
              {formatDate(period.start_date)} — {formatDate(period.end_date)}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Active
            </span>
          </div>
        ) : (
          <p className="text-sm text-amber-300 font-medium">
            No active budget period found for this month.
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Savings Target */}
        <div className="space-y-1.5">
          <Label htmlFor="savings-target" className="flex items-center gap-1.5">
            <Target size={14} className="text-amber-400" /> Period Savings Target (Rp)
          </Label>
          <Input
            id="savings-target"
            type="number"
            min="0"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(Number(e.target.value))}
            placeholder="0"
            className="text-base font-semibold"
          />
          <p className="text-xs text-slate-400">
            Savings target is set aside before calculating the daily allowance.
          </p>
        </div>

        {/* Period Start Day (only if no period or initializing) */}
        {!period && (
          <div className="space-y-1.5">
            <Label htmlFor="period-day">Cycle Start Day / Payday</Label>
            <Select
              id="period-day"
              value={periodStartDay}
              onChange={(e) => setPeriodStartDay(Number(e.target.value))}
              className="bg-slate-900/80"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d} of each month
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-400">
              Your budget cycle runs from this date to the next monthly cycle.
            </p>
          </div>
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 size={16} /> Settings saved successfully!
          </div>
        )}

        <Button
          type="submit"
          disabled={isSaving || updateTargetMutation.isPending}
          className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </Card>
  )
}

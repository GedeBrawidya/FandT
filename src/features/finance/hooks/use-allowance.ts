import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDailyAllowance } from '@/features/finance/api/allowance'
import { getCurrentPeriod, updateSavingsTarget, updateDailyBudgetCap } from '@/features/finance/api/budget-periods'
import { toast } from '@/components/ui/use-toast'

export function useDailyAllowance(date: Date = new Date()) {
  return useQuery({
    queryKey: ['daily-allowance', date.toISOString().split('T')[0]],
    queryFn: () => getDailyAllowance(date),
    refetchInterval: 60_000,
  })
}

export function useBudgetPeriod() {
  return useQuery({
    queryKey: ['budget-period'],
    queryFn: getCurrentPeriod,
  })
}

export function useUpdateSavingsTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ periodId, amount }: { periodId: string; amount: number }) =>
      updateSavingsTarget(periodId, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['budget-period'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
      toast({
        title: 'Savings target saved',
        description: 'Period savings allocation updated.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to save target',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateDailyCap() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => updateDailyBudgetCap(amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['budget-period'] })
      toast({
        title: 'Daily allowance cap saved',
        description: 'Daily cap synced successfully.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to save daily cap',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}

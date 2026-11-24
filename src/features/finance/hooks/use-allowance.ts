import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDailyAllowance } from '@/features/finance/api/allowance'
import { getCurrentPeriod, updateSavingsTarget, updateDailyBudgetCap } from '@/features/finance/api/budget-periods'

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
    },
  })
}

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
        title: 'Target tabungan disimpan',
        description: 'Alokasi tabungan periode ini telah diperbarui.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menyimpan target',
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
        title: 'Jatah harian disimpan',
        description: 'Batas jatah harian berhasil disinkronkan.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menyimpan jatah harian',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}

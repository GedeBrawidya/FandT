import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecurringIncomes,
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
} from '@/features/finance/api/recurring-incomes'
import type { InsertRecurringIncome, RecurringIncome } from '@/types/database'

export function useRecurringIncomes() {
  return useQuery({
    queryKey: ['recurring-incomes'],
    queryFn: getRecurringIncomes,
  })
}

export function useCreateRecurringIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InsertRecurringIncome, 'user_id'>) => createRecurringIncome(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-incomes'] })
    },
  })
}

export function useUpdateRecurringIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecurringIncome> }) =>
      updateRecurringIncome(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-incomes'] })
    },
  })
}

export function useDeleteRecurringIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRecurringIncome(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-incomes'] })
    },
  })
}

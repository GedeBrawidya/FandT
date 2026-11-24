import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getTodayTransactions,
  createTransaction,
  updateTransaction,
  softDeleteTransaction,
  undoDeleteTransaction,
  type TransactionFilters,
} from '@/features/finance/api/transactions'
import type { TransactionInsert } from '@/types/database'

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
  })
}

export function useTodayTransactions() {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: getTodayTransactions,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<TransactionInsert, 'user_id'>) => createTransaction(data),
    onMutate: async () => {
      // Optimistic: cancel outgoing refetches so they don't overwrite
      await qc.cancelQueries({ queryKey: ['daily-allowance'] })
      await qc.cancelQueries({ queryKey: ['transactions', 'today'] })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
    },
    onError: () => {
      // On error, refetch to ensure consistency
      qc.invalidateQueries({ queryKey: ['transactions', 'today'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
    },
  })
}

export function useSoftDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => softDeleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
    },
  })
}

export function useUndoDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => undoDeleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<TransactionInsert, 'user_id'>> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
    },
  })
}

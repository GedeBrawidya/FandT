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
import { toast } from '@/components/ui/use-toast'

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
      await qc.cancelQueries({ queryKey: ['daily-allowance'] })
      await qc.cancelQueries({ queryKey: ['transactions', 'today'] })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
      toast({
        title: 'Transaction recorded successfully',
        description: 'Record has been added to history.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      qc.invalidateQueries({ queryKey: ['transactions', 'today'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      toast({
        title: 'Failed to record transaction',
        description: err?.message || 'An error occurred while saving transaction.',
        variant: 'destructive',
      })
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
      toast({
        title: 'Transaction deleted',
        description: 'Transaction record removed.',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to delete transaction',
        description: err?.message || 'An error occurred.',
        variant: 'destructive',
      })
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
      toast({
        title: 'Transaction restored',
        description: 'Transaction record has been restored.',
        variant: 'success',
      })
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
      toast({
        title: 'Transaction updated successfully',
        description: 'Transaction changes saved.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to update transaction',
        description: err?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}

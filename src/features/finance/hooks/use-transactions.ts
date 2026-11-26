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
        title: 'Transaksi berhasil dicatat',
        description: 'Pengeluaran/pemasukan telah masuk ke histori.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      qc.invalidateQueries({ queryKey: ['transactions', 'today'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
      toast({
        title: 'Gagal mencatat transaksi',
        description: err?.message || 'Terjadi kesalahan saat menyimpan transaksi.',
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
        title: 'Transaksi dihapus',
        description: 'Transaksi telah dipindahkan ke sampah.',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menghapus transaksi',
        description: err?.message || 'Terjadi kendala.',
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
        title: 'Transaksi dipulihkan',
        description: 'Catatan transaksi telah dikembalikan.',
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
        title: 'Transaksi berhasil diperbarui',
        description: 'Perubahan nominal dan rincian transaksi telah disimpan.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal memperbarui transaksi',
        description: err?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWallets, getWalletBalances, createWallet, updateWallet, archiveWallet } from '@/features/finance/api/wallets'
import type { WalletInsert } from '@/types/database'
import { toast } from '@/components/ui/use-toast'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
  })
}

export function useWalletBalances() {
  return useQuery({
    queryKey: ['wallet-balances'],
    queryFn: getWalletBalances,
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<WalletInsert, 'user_id'>) => createWallet(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
      toast({
        title: 'Dompet baru ditambahkan',
        description: 'Rekening dompet berhasil dibuat.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menambahkan dompet',
        description: err?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<WalletInsert, 'user_id'>> }) =>
      updateWallet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
      toast({
        title: 'Dompet berhasil diperbarui',
        description: 'Informasi dompet telah disimpan.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal memperbarui dompet',
        description: err?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    },
  })
}

export function useArchiveWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveWallet(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
      toast({
        title: 'Dompet diarsipkan',
        description: 'Dompet berhasil diarsipkan.',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal mengarsipkan dompet',
        description: err?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    },
  })
}

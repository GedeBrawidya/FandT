import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWallets, getWalletBalances, createWallet, updateWallet, archiveWallet } from '@/features/finance/api/wallets'
import type { WalletInsert } from '@/types/database'

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
    },
  })
}

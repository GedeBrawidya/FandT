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
        title: 'New wallet added',
        description: 'Wallet account created successfully.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to add wallet',
        description: err?.message || 'An error occurred.',
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
        title: 'Wallet updated successfully',
        description: 'Wallet details saved.',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to update wallet',
        description: err?.message || 'An error occurred.',
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
        title: 'Wallet archived',
        description: 'Wallet has been archived.',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to archive wallet',
        description: err?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  addWishlistContribution,
} from '@/features/wishlist/api/wishlist'
import type { WishlistItem } from '@/types/database'
import { toast } from '@/components/ui/use-toast'

export function useWishlist() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: getWishlistItems,
  })

  const createMutation = useMutation({
    mutationFn: createWishlistItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-items'] })
      toast({
        title: 'Target impian berhasil ditambahkan',
        description: 'Mulai menabung untuk mewujudkan impian ini!',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menambahkan impian',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WishlistItem> }) =>
      updateWishlistItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-items'] })
      toast({
        title: 'Target impian berhasil diperbarui',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal memperbarui impian',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-items'] })
      toast({
        title: 'Target impian berhasil dihapus',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menghapus impian',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })

  const depositMutation = useMutation({
    mutationFn: addWishlistContribution,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist-items'] })
      toast({
        title: 'Setoran tabungan berhasil dicatat',
        description: 'Progres impianmu semakin mendekati target!',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal mencatat setoran tabungan',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    createItem: createMutation,
    updateItem: updateMutation,
    deleteItem: deleteMutation,
    addDeposit: depositMutation,
  }
}

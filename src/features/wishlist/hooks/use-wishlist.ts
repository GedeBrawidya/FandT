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
        title: 'Dream target added successfully',
        description: 'Start saving towards your goal!',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to add dream target',
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
        title: 'Dream target updated successfully',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to update dream target',
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
        title: 'Dream target removed',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to delete dream target',
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
        title: 'Savings deposit recorded',
        description: 'Your progress is getting closer to the goal!',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to record savings deposit',
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

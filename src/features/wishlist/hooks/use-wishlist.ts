import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  addWishlistContribution,
} from '@/features/wishlist/api/wishlist'
import type { WishlistItem } from '@/types/database'

export function useWishlist() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: getWishlistItems,
  })

  const createMutation = useMutation({
    mutationFn: createWishlistItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-items'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WishlistItem> }) =>
      updateWishlistItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-items'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-items'] }),
  })

  const depositMutation = useMutation({
    mutationFn: addWishlistContribution,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist-items'] }),
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

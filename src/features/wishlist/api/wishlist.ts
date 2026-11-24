import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { WishlistItem, WishlistContribution } from '@/types/database'
import { addMockWishlistContribution, deleteMockWishlistItem, getMockWishlist, saveMockWishlistItem } from '@/lib/mock-storage'

export async function getWishlistItems(): Promise<
  (WishlistItem & { contributions: WishlistContribution[] })[]
> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('*, contributions:wishlist_contributions(*)')
          .eq('user_id', user.id)
          .order('priority', { ascending: false })
        if (!error && data && data.length > 0) return data as any
      }
    } catch {
      // fallback
    }
  }
  return getMockWishlist() as any
}

export async function createWishlistItem(
  data: Omit<WishlistItem, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'achieved_at'>
): Promise<WishlistItem> {
  if (!supabase) return saveMockWishlistItem(data as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Pengguna belum login')

  const { data: created, error } = await supabase
    .from('wishlist_items')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return created as WishlistItem
}

export async function updateWishlistItem(
  id: string,
  data: Partial<WishlistItem>
): Promise<WishlistItem> {
  if (!supabase) {
    const current = getMockWishlist().find((item) => item.id === id)
    if (!current) throw new Error('Item wishlist tidak ditemukan')
    return saveMockWishlistItem({ ...current, ...data })
  }
  const { data: updated, error } = await supabase
    .from('wishlist_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as WishlistItem
}

export async function deleteWishlistItem(id: string): Promise<void> {
  if (!supabase) {
    deleteMockWishlistItem(id)
    return
  }
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw error
}

export async function addWishlistContribution({
  itemId,
  amount,
  date = format(new Date(), 'yyyy-MM-dd'),
}: {
  itemId: string
  amount: number
  date?: string
}): Promise<WishlistContribution> {
  if (!supabase) {
    addMockWishlistContribution(itemId, amount)
    const item = getMockWishlist().find((wishlistItem) => wishlistItem.id === itemId)
    const contribution = item?.contributions.at(-1)
    if (!contribution) throw new Error('Item wishlist tidak ditemukan')
    return contribution as WishlistContribution
  }

  const { data, error } = await supabase
    .from('wishlist_contributions')
    .insert({
      item_id: itemId,
      amount,
      contributed_on: date,
    })
    .select()
    .single()

  if (error) throw error
  return data as WishlistContribution
}

import { supabase } from '@/lib/supabase'
import type { Wallet, WalletBalance, WalletInsert } from '@/types/database'
import { archiveMockWallet, getMockWallets, getMockWalletBalances, saveMockWallet } from '@/lib/mock-storage'

export async function getWallets(): Promise<Wallet[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: true })
      if (!error && data && data.length > 0) return data
    } catch {
      // fallback
    }
  }
  return getMockWallets()
}

export async function getWalletBalances(): Promise<WalletBalance[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase.rpc('get_wallet_balances', { p_user_id: user.id })
        if (!error && data && data.length > 0) return data
      }
    } catch {
      // fallback
    }
  }
  return getMockWalletBalances() as WalletBalance[]
}

export async function createWallet(input: Omit<WalletInsert, 'user_id'>): Promise<Wallet> {
  if (!supabase) return saveMockWallet(input as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('wallets')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWallet(id: string, input: Partial<Omit<WalletInsert, 'user_id'>>): Promise<Wallet> {
  if (!supabase) {
    const current = getMockWallets().find((wallet) => wallet.id === id)
    if (!current) throw new Error('Dompet tidak ditemukan')
    return saveMockWallet({ ...current, ...input })
  }
  const { data, error } = await supabase
    .from('wallets')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveWallet(id: string): Promise<void> {
  if (!supabase) {
    archiveMockWallet(id)
    return
  }
  const { error } = await supabase
    .from('wallets')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

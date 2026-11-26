import { supabase } from '@/lib/supabase'
import type { Wallet, WalletBalance, WalletInsert } from '@/types/database'
import { archiveMockWallet, getMockWallets, getMockWalletBalances, saveMockWallet, isUuid } from '@/lib/mock-storage'

export async function getWallets(): Promise<Wallet[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: true })
        if (!error && data) return data
        return []
      }
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
      if (user && user.app_metadata?.provider !== 'demo') {
        const { data, error } = await supabase.rpc('get_wallet_balances', { p_user_id: user.id })
        if (!error && data) return data
        return []
      }
    } catch {
      // fallback
    }
  }
  return getMockWalletBalances() as WalletBalance[]
}

export async function createWallet(input: Omit<WalletInsert, 'user_id'>): Promise<Wallet> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        const { data, error } = await supabase
          .from('wallets')
          .insert({ ...input, user_id: user.id })
          .select()
          .single()
        if (!error && data) return data
      }
    } catch {
      // fallback
    }
  }
  return saveMockWallet(input as any)
}

export async function updateWallet(id: string, input: Partial<Omit<WalletInsert, 'user_id'>>): Promise<Wallet> {
  if (supabase && isUuid(id)) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  const current = getMockWallets().find((wallet) => wallet.id === id)
  if (!current) throw new Error('Wallet not found')
  return saveMockWallet({ ...current, ...input })
}

export async function archiveWallet(id: string): Promise<void> {
  if (supabase && isUuid(id)) {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (!error) return
    } catch {
      // fallback
    }
  }
  archiveMockWallet(id)
}

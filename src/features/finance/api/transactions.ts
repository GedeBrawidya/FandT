import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionInsert } from '@/types/database'
import { getMockTransactions, addMockTransaction } from '@/lib/mock-storage'

export interface TransactionFilters {
  start?: Date
  end?: Date
  type?: string
  walletId?: string
  categoryId?: string
  limit?: number
}

export async function getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        let query = supabase
          .from('transactions')
          .select('*, category:categories(*), wallet:wallets!wallet_id(*), to_wallet:wallets!to_wallet_id(*)')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('occurred_on', { ascending: false })
          .order('created_at', { ascending: false })

        if (filters.start) {
          query = query.gte('occurred_on', format(filters.start, 'yyyy-MM-dd'))
        }
        if (filters.end) {
          query = query.lte('occurred_on', format(filters.end, 'yyyy-MM-dd'))
        }
        if (filters.type) {
          query = query.eq('type', filters.type)
        }
        if (filters.walletId) {
          query = query.or(`wallet_id.eq.${filters.walletId},to_wallet_id.eq.${filters.walletId}`)
        }
        if (filters.categoryId) {
          query = query.eq('category_id', filters.categoryId)
        }
        if (filters.limit) {
          query = query.limit(filters.limit)
        }

        const { data, error } = await query
        if (!error && data) return data
        return []
      }
    } catch {
      // fallback
    }
  }
  return getMockTransactions()
}

export async function createTransaction(input: Omit<TransactionInsert, 'user_id'>): Promise<Transaction> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({ ...input, user_id: user.id })
          .select('*, category:categories(*)')
          .single()
        if (!error && data) return data
      }
    } catch {
      // fallback
    }
  }
  return addMockTransaction(input as any)
}

export async function updateTransaction(id: string, input: Partial<Omit<TransactionInsert, 'user_id'>>): Promise<Transaction> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, category:categories(*)')
    .single()
  if (error) throw error
  return data
}

export async function softDeleteTransaction(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function undoDeleteTransaction(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) throw error
}

export async function getTodayTransactions(): Promise<Transaction[]> {
  if (!supabase) return []
  // Jakarta timezone: use current date in Asia/Jakarta
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('occurred_on', today)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

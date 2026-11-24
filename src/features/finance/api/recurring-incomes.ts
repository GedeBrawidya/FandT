import { supabase } from '@/lib/supabase'
import type { RecurringIncome, InsertRecurringIncome } from '@/types/database'

export async function getRecurringIncomes(): Promise<RecurringIncome[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('recurring_incomes')
    .select('*, wallet:wallets(*)')
    .eq('user_id', user.id)
    .order('day_of_month', { ascending: true })

  if (error) throw error
  return (data as RecurringIncome[]) ?? []
}

export async function createRecurringIncome(
  data: Omit<InsertRecurringIncome, 'user_id'>
): Promise<RecurringIncome> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Pengguna belum login')

  const { data: created, error } = await supabase
    .from('recurring_incomes')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return created as RecurringIncome
}

export async function updateRecurringIncome(
  id: string,
  data: Partial<RecurringIncome>
): Promise<RecurringIncome> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { data: updated, error } = await supabase
    .from('recurring_incomes')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as RecurringIncome
}

export async function deleteRecurringIncome(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { error } = await supabase.from('recurring_incomes').delete().eq('id', id)
  if (error) throw error
}

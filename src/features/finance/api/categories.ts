import { supabase } from '@/lib/supabase'
import type { Category, CategoryInsert } from '@/types/database'

export async function getCategories(kind?: 'expense' | 'income' | 'task'): Promise<Category[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
  if (kind) {
    query = query.eq('kind', kind)
  }
  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function createCategory(input: Omit<CategoryInsert, 'user_id'>): Promise<Category> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, input: Partial<Omit<CategoryInsert, 'user_id'>>): Promise<Category> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('categories')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveCategory(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('categories')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

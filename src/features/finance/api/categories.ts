import { supabase } from '@/lib/supabase'
import type { Category, CategoryInsert } from '@/types/database'
import { getMockCategories, saveMockCategory, archiveMockCategory, isUuid } from '@/lib/mock-storage'

export async function getCategories(kind?: 'expense' | 'income' | 'task'): Promise<Category[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
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
        if (!error && data) return data
        return []
      }
    } catch {
      // fallback
    }
  }
  return getMockCategories(kind)
}

export async function createCategory(input: Omit<CategoryInsert, 'user_id'>): Promise<Category> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        const { data, error } = await supabase
          .from('categories')
          .insert({ ...input, user_id: user.id })
          .select()
          .single()
        if (!error && data) return data
      }
    } catch {
      // fallback
    }
  }
  return saveMockCategory(input as any)
}

export async function updateCategory(id: string, input: Partial<Omit<CategoryInsert, 'user_id'>>): Promise<Category> {
  if (supabase && isUuid(id)) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data
    } catch {
      // fallback
    }
  }
  return saveMockCategory({ id, ...input } as any)
}

export async function archiveCategory(id: string): Promise<void> {
  if (supabase && isUuid(id)) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (!error) return
    } catch {
      // fallback
    }
  }
  archiveMockCategory(id)
}

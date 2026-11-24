import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { getMockEvents, saveMockEvent, deleteMockEvent } from '@/lib/mock-storage'

export async function getEvents(): Promise<Event[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('starts_at', { ascending: true })

        if (!error && data && data.length > 0) return data as Event[]
      }
    } catch {
      // fallback
    }
  }
  return getMockEvents()
}

export async function createEvent(
  data: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<Event> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: created, error } = await supabase
          .from('events')
          .insert({ ...data, user_id: user.id })
          .select()
          .single()

        if (!error && created) return created as Event
      }
    } catch {
      // fallback
    }
  }
  return saveMockEvent(data)
}

export async function deleteEvent(id: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (!error) return
    } catch {
      // fallback
    }
  }
  deleteMockEvent(id)
}

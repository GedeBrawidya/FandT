import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { DailyAllowance } from '@/types/database'
import { getMockDailyAllowance } from '@/lib/mock-storage'

export async function getDailyAllowance(date: Date): Promise<DailyAllowance | null> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const dateStr = format(date, 'yyyy-MM-dd')
        const { data, error } = await supabase.rpc('get_daily_allowance', {
          p_user_id: user.id,
          p_date: dateStr,
        })
        if (!error && data) {
          if (Array.isArray(data)) return data[0] ?? null
          return data ?? null
        }
      }
    } catch {
      // fallback to mock
    }
  }
  return getMockDailyAllowance(date)
}

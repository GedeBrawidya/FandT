import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { DailyAllowance } from '@/types/database'
import { getMockDailyAllowance } from '@/lib/mock-storage'

export async function getDailyAllowance(date: Date): Promise<DailyAllowance | null> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        const dateStr = format(date, 'yyyy-MM-dd')
        const { data, error } = await supabase.rpc('get_daily_allowance', {
          p_user_id: user.id,
          p_date: dateStr,
        })
        if (!error && data) {
          if (Array.isArray(data)) return data[0] ?? null
          return data ?? null
        }
        return {
          budget_variabel: 0,
          sisa_budget: 0,
          sisa_hari: 0,
          jatah_harian: 0,
          terpakai_hari_ini: 0,
          sisa_hari_ini: 0,
          savings_target: 0,
          is_over_budget: false,
          is_savings_at_risk: false,
          total_saldo: 0,
          is_safe: true,
        }
      }
    } catch {
      // fallback to mock
    }
  }
  return getMockDailyAllowance(date)
}

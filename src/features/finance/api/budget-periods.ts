import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { BudgetPeriod } from '@/types/database'
import { getMockPeriod, updateMockSavingsTarget, updateMockDailyCap, isUuid } from '@/lib/mock-storage'

export async function getCurrentPeriod(): Promise<(BudgetPeriod & { daily_cap?: number }) | null> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider !== 'demo') {
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
        const { data, error } = await supabase
          .from('budget_periods')
          .select('*')
          .eq('user_id', user.id)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (!error && data) return data
        return null
      }
    } catch {
      // fallback
    }
  }
  return getMockPeriod()
}

export async function createOrEnsurePeriod(periodStartDay: number): Promise<BudgetPeriod> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const existing = await getCurrentPeriod()
  if (existing) return existing

  // Calculate current period start/end based on periodStartDay
  const now = new Date()
  const jakartaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const [year, month, day] = jakartaStr.split('-').map(Number)

  let startYear = year
  let startMonth = month
  if (day < periodStartDay) {
    // Period started last month
    startMonth = month - 1
    if (startMonth === 0) { startMonth = 12; startYear = year - 1 }
  }

  const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(periodStartDay).padStart(2, '0')}`

  // End date is day before next period start
  let endMonth = startMonth + 1
  let endYear = startYear
  if (endMonth > 12) { endMonth = 1; endYear = startYear + 1 }
  const endDateObj = new Date(endYear, endMonth - 1, periodStartDay - 1)
  const endDate = format(endDateObj, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('budget_periods')
    .insert({ user_id: user.id, start_date: startDate, end_date: endDate, savings_target: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSavingsTarget(periodId: string, amount: number): Promise<void> {
  updateMockSavingsTarget(amount)
  if (supabase && isUuid(periodId)) {
    try {
      await supabase
        .from('budget_periods')
        .update({ savings_target: amount, updated_at: new Date().toISOString() })
        .eq('id', periodId)
    } catch {
      // ignore in demo
    }
  }
}

export async function updateDailyBudgetCap(amount: number): Promise<void> {
  updateMockDailyCap(amount)
}

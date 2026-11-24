import { supabase } from '@/lib/supabase'
import type { Bill, BillPayment, InsertBill, Transaction } from '@/types/database'
import { format } from 'date-fns'

export async function getBills(): Promise<Bill[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('bills')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .order('due_day', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data as Bill[]) ?? []
}

export async function createBill(data: Omit<InsertBill, 'user_id'>): Promise<Bill> {
  if (!supabase) {
    throw new Error('Supabase client belum terkonfigurasi')
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Pengguna belum login')

  const { data: created, error } = await supabase
    .from('bills')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return created as Bill
}

export async function updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { data: updated, error } = await supabase
    .from('bills')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as Bill
}

export async function deleteBill(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { error } = await supabase.from('bills').delete().eq('id', id)
  if (error) throw error
}

export async function getBillPaymentsForPeriod(periodStart: string): Promise<BillPayment[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('bill_payments')
    .select('*')
    .eq('period_start', periodStart)

  if (error) throw error
  return (data as BillPayment[]) ?? []
}

export async function payBill({
  billId,
  walletId,
  amount,
  periodStart = format(new Date(), 'yyyy-MM-01'),
}: {
  billId: string
  walletId: string
  amount: number
  periodStart?: string
}): Promise<{ transaction: Transaction; payment: BillPayment }> {
  if (!supabase) throw new Error('Supabase client belum terkonfigurasi')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Pengguna belum login')

  // 1. Create expense transaction with bill_id
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'expense',
      amount,
      wallet_id: walletId,
      bill_id: billId,
      occurred_on: format(new Date(), 'yyyy-MM-dd'),
      note: 'Pembayaran tagihan rutin',
    })
    .select()
    .single()

  if (txError) throw txError

  // 2. Record bill payment
  const { data: payment, error: payError } = await supabase
    .from('bill_payments')
    .insert({
      bill_id: billId,
      period_start: periodStart,
      transaction_id: tx.id,
    })
    .select()
    .single()

  if (payError) throw payError

  return { transaction: tx as Transaction, payment: payment as BillPayment }
}

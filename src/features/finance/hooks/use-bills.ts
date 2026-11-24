import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  payBill,
  getBillPaymentsForPeriod,
} from '@/features/finance/api/bills'
import type { InsertBill, Bill } from '@/types/database'
import { format } from 'date-fns'

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  })
}

export function useBillPayments(periodStart = format(new Date(), 'yyyy-MM-01')) {
  return useQuery({
    queryKey: ['bill-payments', periodStart],
    queryFn: () => getBillPaymentsForPeriod(periodStart),
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InsertBill, 'user_id'>) => createBill(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
    },
  })
}

export function useUpdateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bill> }) => updateBill(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
    },
  })
}

export function useDeleteBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['daily-allowance'] })
    },
  })
}

export function usePayBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      billId: string
      walletId: string
      amount: number
      periodStart?: string
    }) => payBill(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['bill-payments'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['wallet-balances'] })
    },
  })
}

import { describe, it, expect } from 'vitest'
import { formatTransactionsToCSV } from '@/features/finance/api/export'
import { calculateAllowance } from '@/features/finance/utils/allowance'
import type { Transaction } from '@/types/database'

describe('M2 Finance Features', () => {
  describe('CSV Exporting', () => {
    it('correctly generates CSV header and rows', () => {
      const mockTx: Transaction[] = [
        {
          id: '1',
          user_id: 'u1',
          type: 'expense',
          amount: 35000,
          wallet_id: 'w1',
          to_wallet_id: null,
          category_id: 'c1',
          category: {
            id: 'c1',
            user_id: 'u1',
            kind: 'expense',
            name: 'Makan Siang',
            color: '#f97316',
            icon: 'utensils',
            sort_order: 1,
            is_archived: false,
            created_at: '',
            updated_at: '',
          },
          bill_id: null,
          occurred_on: '2026-11-23',
          note: 'Nasi padang "enak"',
          deleted_at: null,
          created_at: '',
          updated_at: '',
        },
      ]

      const csv = formatTransactionsToCSV(mockTx)
      expect(csv).toContain('Date,Type,Amount,Category,Notes')
      expect(csv).toContain('2026-11-23,Expense,35000,"Makan Siang","Nasi padang ""enak"""')
    })
  })

  describe('Fixed Bills & Allowance Interaction (PRD Section 6.3 Rule)', () => {
    it('bill payments do not double-deduct from daily allowance because bills are already budgeted upfront', () => {
      // 1. Initial baseline
      const initial = calculateAllowance({
        totalPemasukan: 3000000,
        targetTabungan: 500000,
        tagihan_tetap_total: 1000000,
        pengeluaranVariabelTerpakai: 0,
        sisaHari: 30,
        terpakai_hari_ini: 0,
      })

      expect(initial.budgetVariabel).toBe(1500000)
      expect(initial.jatahHarian).toBe(50000)
      expect(initial.sisaHariIni).toBe(50000)

      // 2. User pays a bill (1.000.000). Since bill payments have bill_id,
      // they do NOT increase pengeluaranVariabelTerpakai or terpakai_hari_ini.
      const afterBillPayment = calculateAllowance({
        totalPemasukan: 3000000,
        targetTabungan: 500000,
        tagihan_tetap_total: 1000000, // already accounted
        pengeluaranVariabelTerpakai: 0, // variable spending unchanged!
        sisaHari: 30,
        terpakai_hari_ini: 0,
      })

      expect(afterBillPayment.jatahHarian).toBe(50000)
      expect(afterBillPayment.sisaHariIni).toBe(50000)
    })
  })
})

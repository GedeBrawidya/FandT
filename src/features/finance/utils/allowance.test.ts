import { describe, it, expect } from 'vitest'
import { calculateAllowance, getWalletBalance } from './allowance'

describe('calculateAllowance', () => {
  it('PRD baseline: pemasukan 3jt, tabungan 500rb, tagihan 1jt, 30 hari, 0 pengeluaran → jatah 50.000', () => {
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 0,
      sisaHari: 30,
      terpakai_hari_ini: 0,
    })
    expect(result.budgetVariabel).toBe(1_500_000)
    expect(result.jatahHarian).toBe(50_000)
    expect(result.sisaHariIni).toBe(50_000)
    expect(result.isOverBudget).toBe(false)
    expect(result.isSavingsAtRisk).toBe(false)
  })

  it('carry-over: hemat kemarin → jatah hari ini naik', () => {
    // Spent 30.000 yesterday out of 50.000 → saved 20.000 for future
    // With 15 days left, budget sisa = 1.500.000 - 30.000 = 1.470.000
    // jatah = floor(1.470.000 / 15) = 98.000
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 30_000,
      sisaHari: 15,
      terpakai_hari_ini: 0,
    })
    expect(result.sisaBudget).toBe(1_470_000)
    expect(result.jatahHarian).toBe(98_000)
    expect(result.isOverBudget).toBe(false)
  })

  it('saat boros: sisa_hari_ini < 0 → isOverBudget true', () => {
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 0,
      sisaHari: 30,
      terpakai_hari_ini: 80_000, // lebih dari jatah 50.000
    })
    expect(result.sisaHariIni).toBe(50_000 - 80_000) // -30.000
    expect(result.isOverBudget).toBe(true)
  })

  it('sisa_budget <= 0 → isSavingsAtRisk true', () => {
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 1_600_000, // lebih dari budget variabel
      sisaHari: 10,
      terpakai_hari_ini: 0,
    })
    expect(result.sisaBudget).toBe(-100_000)
    expect(result.isSavingsAtRisk).toBe(true)
  })

  it('sisaHari = 0 → jatah = 0', () => {
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 0,
      sisaHari: 0,
      terpakai_hari_ini: 0,
    })
    expect(result.jatahHarian).toBe(0)
    expect(result.sisaHariIni).toBe(0)
  })

  it('savings at risk exact boundary: sisaBudget = 0 → isSavingsAtRisk true', () => {
    const result = calculateAllowance({
      totalPemasukan: 3_000_000,
      targetTabungan: 500_000,
      tagihan_tetap_total: 1_000_000,
      pengeluaranVariabelTerpakai: 1_500_000,
      sisaHari: 10,
      terpakai_hari_ini: 0,
    })
    expect(result.sisaBudget).toBe(0)
    expect(result.isSavingsAtRisk).toBe(true)
  })
})

describe('getWalletBalance', () => {
  const walletId = 'wallet-1'
  const otherWalletId = 'wallet-2'

  it('initial balance only', () => {
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, [])).toBe(500_000)
  })

  it('income increases balance', () => {
    const txs = [{ type: 'income', amount: 100_000, wallet_id: walletId, deleted_at: null }]
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, txs)).toBe(600_000)
  })

  it('expense decreases balance', () => {
    const txs = [{ type: 'expense', amount: 50_000, wallet_id: walletId, deleted_at: null }]
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, txs)).toBe(450_000)
  })

  it('transfer tidak mempengaruhi jatah harian (transfer out decreases, transfer in increases)', () => {
    const txs = [
      { type: 'transfer', amount: 100_000, wallet_id: walletId, to_wallet_id: otherWalletId, deleted_at: null },
    ]
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, txs)).toBe(400_000)
    expect(getWalletBalance({ id: otherWalletId, initial_balance: 200_000 }, txs)).toBe(300_000)
  })

  it('soft-deleted transactions are ignored', () => {
    const txs = [
      { type: 'expense', amount: 50_000, wallet_id: walletId, deleted_at: '2026-01-01T00:00:00Z' },
    ]
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, txs)).toBe(500_000)
  })

  it('combined: income + expense + transfer', () => {
    const txs = [
      { type: 'income', amount: 1_000_000, wallet_id: walletId, deleted_at: null },
      { type: 'expense', amount: 200_000, wallet_id: walletId, deleted_at: null },
      { type: 'transfer', amount: 100_000, wallet_id: walletId, to_wallet_id: otherWalletId, deleted_at: null },
    ]
    // 500.000 + 1.000.000 - 200.000 - 100.000 = 1.200.000
    expect(getWalletBalance({ id: walletId, initial_balance: 500_000 }, txs)).toBe(1_200_000)
  })
})

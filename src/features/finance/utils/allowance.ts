// Pure utility functions for allowance calculation.
// NO Supabase, NO side effects – easily unit testable.

export interface AllowanceInput {
  totalPemasukan: number          // total income this period
  targetTabungan: number          // savings target
  tagihan_tetap_total: number     // total fixed bills
  pengeluaranVariabelTerpakai: number // variable spending before today
  sisaHari: number                // days remaining (inclusive of today)
  terpakai_hari_ini: number       // variable spending today
}

export interface AllowanceResult {
  budgetVariabel: number
  sisaBudget: number
  jatahHarian: number
  sisaHariIni: number
  isOverBudget: boolean     // sisaHariIni < 0
  isSavingsAtRisk: boolean  // sisaBudget <= 0
}

export function calculateAllowance(input: AllowanceInput): AllowanceResult {
  const {
    totalPemasukan,
    targetTabungan,
    tagihan_tetap_total,
    pengeluaranVariabelTerpakai,
    sisaHari,
    terpakai_hari_ini,
  } = input

  const budgetVariabel = totalPemasukan - targetTabungan - tagihan_tetap_total
  const sisaBudget = budgetVariabel - pengeluaranVariabelTerpakai
  const jatahHarian = sisaHari > 0 ? Math.floor(sisaBudget / sisaHari) : 0
  const sisaHariIni = jatahHarian - terpakai_hari_ini

  return {
    budgetVariabel,
    sisaBudget,
    jatahHarian,
    sisaHariIni,
    isOverBudget: sisaHariIni < 0,
    isSavingsAtRisk: sisaBudget <= 0,
  }
}

export interface WalletTx {
  type: string
  amount: number
  wallet_id?: string | null
  to_wallet_id?: string | null
  deleted_at?: string | null
}

export function getWalletBalance(
  wallet: { id?: string; initial_balance: number },
  transactions: WalletTx[]
): number {
  let balance = wallet.initial_balance
  for (const tx of transactions) {
    if (tx.deleted_at) continue
    if (tx.type === 'income' && tx.wallet_id === wallet.id) {
      balance += tx.amount
    } else if (tx.type === 'expense' && tx.wallet_id === wallet.id) {
      balance -= tx.amount
    } else if (tx.type === 'transfer') {
      if (tx.wallet_id === wallet.id) balance -= tx.amount
      if (tx.to_wallet_id === wallet.id) balance += tx.amount
    }
  }
  return balance
}

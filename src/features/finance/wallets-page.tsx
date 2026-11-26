import { WalletList } from '@/features/finance/components/wallet-list'
import { useWalletBalances } from '@/features/finance/hooks/use-wallets'
import { Card } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import { WalletCards } from 'lucide-react'

export function WalletsPage() {
  const { data: balances = [] } = useWalletBalances()
  const totalBalance = balances.reduce((acc, w) => acc + (w.balance ?? 0), 0)

  return (
    <div className="space-y-6 pb-20">
      {/* Total Balance Hero Card */}
      <Card className="p-6 sm:p-7 border border-stone-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 mb-1.5 text-stone-500 dark:text-stone-400">
          <WalletCards size={18} className="text-stone-800 dark:text-stone-200" />
          <span className="text-xs uppercase tracking-wider font-bold">Combined Total Balance</span>
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
          {formatRupiah(totalBalance)}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Real-time calculation across all cash, bank accounts, and e-wallets.
        </p>
      </Card>

      {/* Wallet List Component */}
      <WalletList />
    </div>
  )
}

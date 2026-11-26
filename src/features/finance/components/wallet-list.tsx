import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWallets, useWalletBalances, useArchiveWallet } from '@/features/finance/hooks/use-wallets'
import { WalletForm } from '@/features/finance/components/wallet-form'
import { formatRupiah } from '@/lib/format'
import type { Wallet } from '@/types/database'
import { Plus, Edit2, Archive, Wallet as WalletIcon, CreditCard, Smartphone } from 'lucide-react'

export function WalletList() {
  const { data: wallets = [], isLoading: loadingWallets } = useWallets()
  const { data: balances = [], isLoading: loadingBalances } = useWalletBalances()
  const archiveMutation = useArchiveWallet()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<(Wallet & { balance?: number }) | null>(null)

  const handleEdit = (wallet: Wallet) => {
    const currentBalance = balanceMap.get(wallet.id) ?? wallet.initial_balance ?? 0
    setEditingWallet({ ...wallet, balance: currentBalance })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingWallet(null)
    setIsFormOpen(true)
  }

  const handleArchive = async (id: string, name: string) => {
    if (window.confirm(`Arsipkan dompet "${name}"? Dompet tidak akan muncul lagi di daftar aktif.`)) {
      await archiveMutation.mutateAsync(id)
    }
  }

  // Map balances by wallet_id or id
  const balanceMap = new Map<string, number>()
  for (const b of balances) {
    const key = b.wallet_id || b.id || ''
    if (key) balanceMap.set(key, b.balance)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard size={18} className="text-sky-400" />
      case 'ewallet':
        return <Smartphone size={18} className="text-purple-400" />
      case 'cash':
      default:
        return <WalletIcon size={18} className="text-emerald-400" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bank':
        return <Badge variant="info">Bank</Badge>
      case 'ewallet':
        return <Badge variant="warning">E-Wallet</Badge>
      case 'cash':
      default:
        return <Badge variant="success">Tunai</Badge>
    }
  }

  if (loadingWallets || loadingBalances) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Wallets List</h2>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 lisso-btn-black">
          <Plus size={16} /> Add Wallet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
          <WalletIcon size={32} className="text-stone-400" />
          <p className="text-sm text-stone-500 dark:text-stone-400">No active wallets yet.</p>
          <Button size="sm" onClick={handleAdd} className="lisso-btn-black">
            Create First Wallet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wallets.map((wallet) => {
            const currentBalance = balanceMap.get(wallet.id) ?? wallet.initial_balance
            return (
              <Card
                key={wallet.id}
                className="p-4 flex items-center justify-between border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.16] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-stone-100 dark:bg-white/[0.05] border border-stone-200/80 dark:border-white/[0.08]">
                    {getTypeIcon(wallet.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{wallet.name}</span>
                      {getTypeBadge(wallet.type)}
                    </div>
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums mt-0.5">
                      {formatRupiah(currentBalance)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                    title="Edit Wallet"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleArchive(wallet.id, wallet.name)}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Archive Wallet"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <WalletForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        wallet={editingWallet}
      />
    </div>
  )
}

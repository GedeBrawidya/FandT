import { useState } from 'react'
import { useWallets } from '@/features/finance/hooks/use-wallets'
import { usePayBill } from '@/features/finance/hooks/use-bills'
import { formatRupiah } from '@/lib/format'
import type { Bill } from '@/types/database'
import { X, Check } from 'lucide-react'

interface PayBillModalProps {
  open: boolean
  onClose: () => void
  bill: Bill | null
}

export function PayBillModal({ open, onClose, bill }: PayBillModalProps) {
  const { data: wallets = [] } = useWallets()
  const payBill = usePayBill()
  const [selectedWalletId, setSelectedWalletId] = useState('')

  if (!open || !bill) return null

  const activeWallets = wallets.filter((w) => !w.is_archived)
  const currentWalletId = selectedWalletId || activeWallets[0]?.id || ''

  const handleConfirmPay = async () => {
    if (!currentWalletId) return

    await payBill.mutateAsync({
      billId: bill.id,
      walletId: currentWalletId,
      amount: bill.amount,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Pay Bill
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-1 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{bill.name}</p>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            {formatRupiah(bill.amount)}
          </p>
          <p className="text-[11px] text-stone-400">Due every month on day {bill.due_day ?? '-'}</p>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5 block">
            Pay From Wallet
          </label>
          <select
            value={currentWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
          >
            {activeWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.type})
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPay}
            disabled={payBill.isPending}
            className="lisso-btn-black text-xs gap-1.5"
          >
            <Check size={14} />
            <span>{payBill.isPending ? 'Processing...' : 'Confirm Payment'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

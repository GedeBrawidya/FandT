import { useState } from 'react'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import { formatRupiah } from '@/lib/format'
import type { WishlistItem } from '@/types/database'
import { X, DollarSign, Plus } from 'lucide-react'

interface WishlistDepositDialogProps {
  open: boolean
  onClose: () => void
  item: WishlistItem | null
}

export function WishlistDepositDialog({ open, onClose, item }: WishlistDepositDialogProps) {
  const [amount, setAmount] = useState('')
  const { addDeposit } = useWishlist()

  if (!open || !item) return null

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(amount, 10)
    if (isNaN(num) || num <= 0) return

    await addDeposit.mutateAsync({
      itemId: item.id,
      amount: num,
    })

    setAmount('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Record Savings Deposit
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#181818] space-y-1 text-center">
          <p className="text-xs text-stone-400 font-medium">{item.name}</p>
          <p className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
            Target: {formatRupiah(item.target_price)}
          </p>
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Deposit Amount (Rp)
            </label>
            <input
              type="number"
              required
              min={10000}
              placeholder="e.g., 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#181818] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addDeposit.isPending}
              className="lisso-btn-black text-xs gap-1"
            >
              <span>{addDeposit.isPending ? 'Saving...' : 'Add Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

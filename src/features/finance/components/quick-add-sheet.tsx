import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { useWallets } from '@/features/finance/hooks/use-wallets'
import { useCreateTransaction } from '@/features/finance/hooks/use-transactions'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Delete, Calendar, ArrowRight } from 'lucide-react'

interface QuickAddSheetProps {
  open: boolean
  onClose: () => void
}

export function QuickAddSheet({ open, onClose }: QuickAddSheetProps) {
  const [amountStr, setAmountStr] = useState('0')
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [note, setNote] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { data: categories = [] } = useCategories(transactionType)
  const { data: wallets = [] } = useWallets()
  const createTx = useCreateTransaction()

  const activeWallets = useMemo(() => wallets.filter((w) => !w.is_archived), [wallets])
  const activeCategories = useMemo(() => categories.filter((c) => !c.is_archived), [categories])

  const currentWalletId = selectedWalletId || activeWallets[0]?.id || ''
  const currentCategoryId = selectedCategoryId || activeCategories[0]?.id || ''

  const amount = parseInt(amountStr, 10) || 0

  const handleNumpadPress = (digit: string) => {
    if (digit === 'del') {
      setAmountStr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)))
    } else if (digit === '000') {
      if (amountStr === '0') return
      setAmountStr((prev) => (prev.length + 3 > 12 ? prev : prev + '000'))
    } else {
      setAmountStr((prev) => (prev === '0' ? digit : prev.length >= 12 ? prev : prev + digit))
    }
  }

  const handleSave = async () => {
    if (amount <= 0) return

    await createTx.mutateAsync({
      type: transactionType,
      amount,
      wallet_id: currentWalletId || null,
      to_wallet_id: null,
      category_id: currentCategoryId || null,
      bill_id: null,
      occurred_on: occurredOn,
      note: note.trim() || null,
      deleted_at: null,
    })

    setAmountStr('0')
    setNote('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={transactionType === 'income' ? 'Quick Add Income' : 'Quick Add Expense'} className="max-w-lg mx-auto">
      <div className="flex flex-col gap-4 text-stone-900 dark:text-stone-100">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-800">
          {(['expense', 'income'] as const).map((type) => (
            <button key={type} type="button" onClick={() => { setTransactionType(type); setSelectedCategoryId('') }} className={cn('rounded-xl py-2 text-xs font-bold transition-colors', transactionType === type ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700')}>
              {type === 'expense' ? 'Uang keluar' : 'Uang masuk'}
            </button>
          ))}
        </div>
        {/* Large Amount Display */}
        <div className="flex flex-col items-center justify-center py-4 px-6 bg-stone-50 dark:bg-stone-800/60 rounded-3xl border border-stone-200/80 dark:border-white/[0.08]">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {transactionType === 'income' ? 'Income Amount' : 'Expense Amount'}
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums mt-1">
            {formatRupiah(amount)}
          </span>
        </div>

        {/* Category Horizontal Chips */}
        <div>
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-2 block">
            Category
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeCategories.map((c) => {
              const isSelected = c.id === currentCategoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: c.color || '#10b981' }}
                  />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Wallet & Date Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1 block">
              Wallet Source
            </label>
            <select
              value={currentWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full text-xs font-medium h-10 px-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            >
              {activeWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1">
              <Calendar size={12} /> Date
            </label>
            <Input
              type="date"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
              className="text-xs h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 border-stone-200/80 dark:border-white/[0.08]"
            />
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <Input
            placeholder="Additional notes (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-xs h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 border-stone-200/80 dark:border-white/[0.08]"
          />
        </div>

        {/* Numpad 3x4 Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNumpadPress(key)}
              className={cn(
                'h-12 flex items-center justify-center rounded-2xl text-lg font-bold transition active:scale-95',
                key === 'del'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                  : 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
              )}
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={amount <= 0 || createTx.isPending}
          className="w-full mt-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-bold h-12 text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
        >
          <span>{createTx.isPending ? 'Saving...' : transactionType === 'income' ? 'Save Income' : 'Save Expense'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </Sheet>
  )
}

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { useWallets } from '@/features/finance/hooks/use-wallets'
import { useCreateTransaction, useUpdateTransaction } from '@/features/finance/hooks/use-transactions'
import type { Transaction } from '@/types/database'
import { confirmDialog } from '@/components/ui/confirm-dialog'

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  occurred_on: z.string().min(1, 'Tanggal wajib diisi'),
  category_id: z.string().optional().nullable(),
  wallet_id: z.string().optional().nullable(),
  to_wallet_id: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
}).refine((data) => {
  if (data.type === 'transfer') {
    return data.wallet_id && data.to_wallet_id && data.wallet_id !== data.to_wallet_id
  }
  return true
}, {
  message: 'Source and destination wallets must be different and selected',
  path: ['to_wallet_id'],
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
}

export function TransactionForm({ open, onClose, transaction }: TransactionFormProps) {
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      occurred_on: format(new Date(), 'yyyy-MM-dd'),
      category_id: null,
      wallet_id: null,
      to_wallet_id: null,
      note: '',
    },
  })

  const currentType = watch('type')
  const { data: categories = [] } = useCategories(currentType === 'transfer' ? undefined : currentType)
  const { data: wallets = [] } = useWallets()

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        occurred_on: transaction.occurred_on,
        category_id: transaction.category_id,
        wallet_id: transaction.wallet_id,
        to_wallet_id: transaction.to_wallet_id,
        note: transaction.note || '',
      })
    } else {
      reset({
        type: 'expense',
        amount: 0,
        occurred_on: format(new Date(), 'yyyy-MM-dd'),
        category_id: categories[0]?.id || null,
        wallet_id: wallets[0]?.id || null,
        to_wallet_id: null,
        note: '',
      })
    }
  }, [transaction, reset, open])

  const onSubmit = async (values: TransactionFormData) => {
    try {
      if (transaction) {
        const ok = await confirmDialog({
          title: 'Simpan Transaksi',
          description: 'Simpan perubahan pada transaksi ini?',
          confirmText: 'Simpan',
          variant: 'default',
        })
        if (!ok) return
        await updateTx.mutateAsync({
          id: transaction.id,
          data: {
            type: values.type,
            amount: values.amount,
            occurred_on: values.occurred_on,
            category_id: values.type === 'transfer' ? null : (values.category_id || null),
            wallet_id: values.wallet_id || null,
            to_wallet_id: values.type === 'transfer' ? (values.to_wallet_id || null) : null,
            note: values.note?.trim() || null,
          },
        })
      } else {
        await createTx.mutateAsync({
          type: values.type,
          amount: values.amount,
          occurred_on: values.occurred_on,
          category_id: values.type === 'transfer' ? null : (values.category_id || null),
          wallet_id: values.wallet_id || null,
          to_wallet_id: values.type === 'transfer' ? (values.to_wallet_id || null) : null,
          bill_id: null,
          note: values.note?.trim() || null,
          deleted_at: null,
        })
      }
      onClose()
    } catch (err) {
      console.error('Failed to submit transaction:', err)
    }
  }

  const activeWallets = wallets.filter(w => !w.is_archived)

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader>
        <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                currentType === t
                  ? t === 'expense'
                    ? 'bg-red-500 text-white shadow'
                    : t === 'income'
                    ? 'bg-emerald-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'expense' ? 'Expense' : t === 'income' ? 'Income' : 'Transfer'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="tx-amount">Amount (Rp)</Label>
          <Input
            id="tx-amount"
            type="number"
            placeholder="0"
            className="text-lg font-bold"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-xs text-red-400">{errors.amount.message}</p>
          )}
        </div>

        {/* Category (only for expense and income) */}
        {currentType !== 'transfer' && (
          <div className="space-y-1.5">
            <Label htmlFor="tx-category">Category</Label>
            <Select
              id="tx-category"
              {...register('category_id')}
              className="bg-slate-900/80"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.category_id && (
              <p className="text-xs text-red-400">{errors.category_id.message}</p>
            )}
          </div>
        )}

        {/* Wallets */}
        {currentType === 'transfer' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-from-wallet">From Wallet</Label>
              <Select
                id="tx-from-wallet"
                {...register('wallet_id')}
                className="bg-slate-900/80"
              >
                <option value="">Select...</option>
                {activeWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-to-wallet">To Wallet</Label>
              <Select
                id="tx-to-wallet"
                {...register('to_wallet_id')}
                className="bg-slate-900/80"
              >
                <option value="">Select...</option>
                {activeWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="tx-wallet">Wallet</Label>
            <Select
              id="tx-wallet"
              {...register('wallet_id')}
              className="bg-slate-900/80"
            >
              <option value="">Select Wallet...</option>
              {activeWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.type})
                </option>
              ))}
            </Select>
            {errors.wallet_id && (
              <p className="text-xs text-red-400">{errors.wallet_id.message}</p>
            )}
          </div>
        )}
        {errors.to_wallet_id && (
          <p className="text-xs text-red-400">{errors.to_wallet_id.message}</p>
        )}

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="tx-date">Date</Label>
          <Input
            id="tx-date"
            type="date"
            {...register('occurred_on')}
            className="bg-slate-900/80"
          />
          {errors.occurred_on && (
            <p className="text-xs text-red-400">{errors.occurred_on.message}</p>
          )}
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="tx-note">Note (optional)</Label>
          <Input
            id="tx-note"
            placeholder="Transaction note..."
            {...register('note')}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createTx.isPending || updateTx.isPending}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold"
          >
            {transaction ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

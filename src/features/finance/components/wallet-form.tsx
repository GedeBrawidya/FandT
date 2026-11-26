import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateWallet, useUpdateWallet } from '@/features/finance/hooks/use-wallets'
import type { Wallet } from '@/types/database'

const walletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').max(50, 'Name is too long'),
  type: z.enum(['cash', 'bank', 'ewallet'], {
    required_error: 'Select wallet type',
  }),
  initial_balance: z.coerce.number().min(0, 'Initial balance cannot be negative'),
})

type WalletFormData = z.infer<typeof walletSchema>

interface WalletFormProps {
  open: boolean
  onClose: () => void
  wallet?: (Wallet & { balance?: number }) | null
}

export function WalletForm({ open, onClose, wallet }: WalletFormProps) {
  const createWalletMutation = useCreateWallet()
  const updateWalletMutation = useUpdateWallet()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      type: 'cash',
      initial_balance: 0,
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (wallet) {
      reset({
        name: wallet.name,
        type: wallet.type,
        initial_balance: wallet.balance ?? wallet.initial_balance ?? 0,
      })
    } else {
      reset({
        name: '',
        type: 'cash',
        initial_balance: 0,
      })
    }
  }, [wallet, reset, open])

  const onSubmit = async (values: WalletFormData) => {
    try {
      if (wallet) {
        if (!window.confirm(`Simpan perubahan pada dompet "${values.name}"?`)) return
        await updateWalletMutation.mutateAsync({
          id: wallet.id,
          data: {
            name: values.name,
            type: values.type,
            initial_balance: Number(values.initial_balance) || 0,
          },
        })
      } else {
        await createWalletMutation.mutateAsync({
          name: values.name,
          type: values.type,
          initial_balance: Number(values.initial_balance) || 0,
          is_archived: false,
        })
      }
      onClose()
    } catch (err) {
      console.error('Failed to save wallet:', err)
    }
  }

  const types = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'bank', label: 'Bank', icon: '🏦' },
    { id: 'ewallet', label: 'E-Wallet', icon: '📱' },
  ] as const

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{wallet ? 'Edit Wallet' : 'Add New Wallet'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="wallet-name">Wallet Name</Label>
          <Input
            id="wallet-name"
            placeholder="e.g., Main Wallet, BCA, GoPay"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Type Selection */}
        <div className="space-y-1.5">
          <Label>Wallet Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setValue('type', t.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedType === t.id
                    ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900 shadow-sm'
                    : 'border-stone-200/80 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-white/[0.08] dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-stone-800'
                }`}
              >
                <span className="text-xl mb-1">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-xs text-red-400">{errors.type.message}</p>
          )}
        </div>

        {/* Initial Balance */}
        <div className="space-y-1.5">
          <Label htmlFor="initial-balance">
            {wallet ? 'Current Balance (Rp)' : 'Initial Balance (Rp)'}
          </Label>
          <Input
            id="initial-balance"
            type="number"
            placeholder="0"
            {...register('initial_balance')}
          />
          {errors.initial_balance && (
            <p className="text-xs text-red-400">{errors.initial_balance.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createWalletMutation.isPending || updateWalletMutation.isPending}
            className="lisso-btn-black font-semibold"
          >
            {wallet ? 'Save Changes' : 'Add Wallet'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

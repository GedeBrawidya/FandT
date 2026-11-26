import { useState, useEffect } from 'react'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { useCreateBill, useUpdateBill } from '@/features/finance/hooks/use-bills'
import type { Bill } from '@/types/database'
import { X } from 'lucide-react'

interface BillFormModalProps {
  open: boolean
  onClose: () => void
  initialData?: Bill | null
}

export function BillFormModal({ open, onClose, initialData }: BillFormModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [categoryId, setCategoryId] = useState('')
  const [recurrence, setRecurrence] = useState<'monthly' | 'none'>('monthly')

  const { data: categories = [] } = useCategories('expense')
  const createBill = useCreateBill()
  const updateBill = useUpdateBill()

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setAmount(initialData.amount.toString())
      setDueDay(initialData.due_day?.toString() ?? '1')
      setCategoryId(initialData.category_id ?? '')
      setRecurrence(initialData.recurrence as 'monthly' | 'none')
    } else {
      setName('')
      setAmount('')
      setDueDay('1')
      setCategoryId(categories[0]?.id ?? '')
      setRecurrence('monthly')
    }
  }, [initialData, categories, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseInt(amount, 10)
    const numDay = parseInt(dueDay, 10)
    if (!name || isNaN(numAmount) || numAmount <= 0) return

    if (initialData) {
      if (!window.confirm(`Simpan perubahan tagihan "${name.trim()}"?`)) return
      await updateBill.mutateAsync({
        id: initialData.id,
        data: {
          name,
          amount: numAmount,
          due_day: numDay,
          category_id: categoryId || null,
          recurrence,
        },
      })
    } else {
      await createBill.mutateAsync({
        name,
        amount: numAmount,
        due_day: numDay,
        category_id: categoryId || null,
        recurrence,
        is_active: true,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            {initialData ? 'Edit Fixed Bill' : 'Add New Fixed Bill'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Bill Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Home WiFi, Electricity, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Amount (Rp)
            </label>
            <input
              type="number"
              required
              min={1000}
              placeholder="350000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Due Date (Day 1–28)
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as 'monthly' | 'none')}
                className="w-full text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="none">One-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              type="submit"
              disabled={createBill.isPending || updateBill.isPending}
              className="lisso-btn-black text-xs"
            >
              {createBill.isPending || updateBill.isPending ? 'Saving...' : 'Save Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

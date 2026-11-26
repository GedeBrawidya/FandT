import { useState, useEffect } from 'react'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import type { WishlistItem } from '@/types/database'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import { X } from 'lucide-react'

interface WishlistFormDialogProps {
  open: boolean
  onClose: () => void
  initialItem?: WishlistItem | null
}

export function WishlistFormDialog({ open, onClose, initialItem }: WishlistFormDialogProps) {
  const [name, setName] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState('3')
  const [note, setNote] = useState('')

  const { createItem, updateItem, deleteItem } = useWishlist()

  const handleDelete = async () => {
    if (!initialItem) return
    const ok = await confirmDialog({
      title: 'Delete Dream Target',
      description: `Are you sure you want to delete "${initialItem.name}"?`,
      confirmText: 'Delete Target',
      cancelText: 'Cancel',
      variant: 'destructive',
    })
    if (ok) {
      await deleteItem.mutateAsync(initialItem.id)
      onClose()
    }
  }

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name)
      setTargetPrice(initialItem.target_price.toString())
      setImagePath(initialItem.image_path ?? '')
      setUrl(initialItem.url ?? '')
      setPriority(initialItem.priority.toString())
      setNote(initialItem.note ?? '')
    } else {
      setName('')
      setTargetPrice('')
      setImagePath('')
      setUrl('')
      setPriority('3')
      setNote('')
    }
  }, [initialItem, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceNum = parseInt(targetPrice, 10)
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) return

    if (initialItem) {
      const ok = await confirmDialog({
        title: 'Save Dream Target',
        description: `Save changes to "${name.trim()}"?`,
        confirmText: 'Save',
        variant: 'default',
      })
      if (!ok) return
      await updateItem.mutateAsync({
        id: initialItem.id,
        data: {
          name: name.trim(),
          target_price: priceNum,
          image_path: imagePath.trim() || null,
          url: url.trim() || null,
          priority: parseInt(priority, 10) || 3,
          note: note.trim() || null,
        },
      })
    } else {
      await createItem.mutateAsync({
        name: name.trim(),
        target_price: priceNum,
        image_path: imagePath.trim() || null,
        url: url.trim() || null,
        priority: parseInt(priority, 10) || 3,
        status: 'menabung',
        note: note.trim() || null,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            {initialItem ? 'Edit Wishlist Item' : 'Add New Wishlist Item'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Item / Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., MacBook Pro M4, iPhone 16, Bali Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Target Price (Rp)
            </label>
            <input
              type="number"
              required
              min={10000}
              placeholder="18000000"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Image URL (Optional for Vision Board)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className="w-full text-xs font-medium h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Product Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://tokopedia.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-medium h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Priority Level (1–5)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              >
                <option value="5">Highest (5)</option>
                <option value="4">High (4)</option>
                <option value="3">Normal (3)</option>
                <option value="2">Low (2)</option>
                <option value="1">Collection (1)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Notes / Motivation
            </label>
            <textarea
              rows={2}
              placeholder="Why do you want this item..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs font-medium p-3 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100 dark:border-white/[0.08]">
            {initialItem ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteItem.isPending}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
              >
                {deleteItem.isPending ? 'Deleting...' : 'Delete Item'}
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#181818] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createItem.isPending || updateItem.isPending}
                className="lisso-btn-black text-xs"
              >
                {createItem.isPending || updateItem.isPending ? 'Saving...' : 'Save Wishlist Item'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

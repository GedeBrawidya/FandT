import { useState, useEffect } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}

type Resolver = (value: boolean) => void

let openFn: ((options: ConfirmOptions, resolve: Resolver) => void) | null = null

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (openFn) {
      openFn(options, resolve)
    } else {
      resolve(window.confirm(options.description || options.title))
    }
  })
}

export function GlobalConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: '' })
  const [resolver, setResolver] = useState<Resolver | null>(null)

  useEffect(() => {
    openFn = (opts, resolve) => {
      setOptions(opts)
      setResolver(() => resolve)
      setOpen(true)
    }
    return () => {
      openFn = null
    }
  }, [])

  const handleConfirm = () => {
    setOpen(false)
    resolver?.(true)
  }

  const handleCancel = () => {
    setOpen(false)
    resolver?.(false)
  }

  if (!open) return null

  const isDestructive = options.variant !== 'default'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141414] p-6 shadow-2xl border border-stone-200/90 dark:border-white/[0.12] space-y-4 animate-in zoom-in-95 duration-200"
        role="alertdialog"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
            }`}
          >
            {isDestructive ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              {options.title}
            </h3>
            {options.description && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {options.description}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#181818] transition-colors"
          >
            {options.cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                : 'lisso-btn-black'
            }`}
          >
            {options.confirmText || (isDestructive ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

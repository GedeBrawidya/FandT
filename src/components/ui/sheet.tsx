import { type ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  title?: string
}

export function Sheet({ open, onClose, children, className, title }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-[#141414] text-stone-900 dark:text-stone-100 rounded-t-[32px] p-6 shadow-2xl border-t border-stone-200/60 dark:border-white/[0.08]',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto touch-target flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

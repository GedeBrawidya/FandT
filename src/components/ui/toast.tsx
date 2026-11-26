import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast } from './use-toast'

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

const iconMap = {
  default: <Info size={16} className="text-stone-500 dark:text-stone-400" />,
  success: <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />,
  destructive: <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />,
  warning: <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />,
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl p-4 max-w-sm w-full',
        'bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md',
        'border border-stone-200/90 dark:border-white/[0.12] shadow-2xl',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{iconMap[toast.variant ?? 'default']}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none md:bottom-6 md:items-end md:right-6 md:left-auto">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}

import { useState, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

const iconMap = {
  default: <Info size={16} className="text-slate-300" />,
  success: <CheckCircle size={16} className="text-emerald-400" />,
  destructive: <AlertCircle size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        'glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-glass max-w-sm w-full',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{iconMap[toast.variant ?? 'default']}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-50">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-slate-400">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-500 hover:text-slate-200 transition-colors"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

interface ToasterProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:right-6 md:left-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

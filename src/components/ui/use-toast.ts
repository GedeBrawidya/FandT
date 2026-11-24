import { useState, useCallback } from 'react'
import type { Toast, ToastVariant } from './toast'

let count = 0

function genId() {
  return `toast-${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 4000,
    }: Omit<Toast, 'id'>) => {
      const id = genId()
      setToasts((prev) => [...prev, { id, title, description, variant, duration }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  return { toasts, toast, dismiss }
}

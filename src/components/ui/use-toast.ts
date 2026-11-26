import { useState, useEffect, useCallback } from 'react'
import type { Toast, ToastVariant } from './toast'

let count = 0
function genId() {
  return `toast-${++count}`
}

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let memoryToasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function dispatch(toasts: Toast[]) {
  memoryToasts = toasts
  listeners.forEach((listener) => listener(memoryToasts))
}

export function dismissToast(id: string) {
  dispatch(memoryToasts.filter((t) => t.id !== id))
}

export function toast(input: ToastInput) {
  const id = genId()
  const duration = input.duration ?? 3500
  const newToast: Toast = { id, duration, ...input }

  dispatch([...memoryToasts, newToast])

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    dismissToast(id)
  }, [])

  return { toasts, toast, dismiss }
}

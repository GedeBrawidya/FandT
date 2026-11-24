import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-2xl border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/80 dark:bg-stone-800/60 px-3.5 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors',
      'focus:outline-none focus:border-stone-900/60 dark:focus:border-white/40 focus:ring-1 focus:ring-stone-900/20 dark:focus:ring-white/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }

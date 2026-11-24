import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-white dark:bg-[#141414] rounded-[24px] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] text-stone-900 dark:text-stone-100 transition-colors duration-200',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export { Card }

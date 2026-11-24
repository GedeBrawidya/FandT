import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'touch-target inline-flex items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold tracking-tight transition-all duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:
          'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-xs',
        secondary:
          'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700',
        outline:
          'border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800',
        glass:
          'bg-white/80 dark:bg-[#141414]/80 border border-stone-200/60 dark:border-white/10 text-stone-900 dark:text-stone-100 hover:bg-white dark:hover:bg-[#1c1c1c]',
        ghost:
          'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800',
      },
      size: {
        default: 'h-10 px-5',
        icon: 'h-10 w-10 px-0',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-12 px-6 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

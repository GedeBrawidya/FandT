import { type HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/10 border border-white/20 text-slate-200',
        success: 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300',
        warning: 'bg-amber-500/20 border border-amber-400/30 text-amber-300',
        destructive: 'bg-red-500/20 border border-red-400/30 text-red-300',
        info: 'bg-sky-500/20 border border-sky-400/30 text-sky-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }

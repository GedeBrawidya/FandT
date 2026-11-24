import { type HTMLAttributes, type ImgHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizeMap[size], className)}
      {...props}
    />
  )
)
Avatar.displayName = 'Avatar'

const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = '', ...props }, ref) => (
    <img ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} alt={alt} {...props} />
  )
)
AvatarImage.displayName = 'AvatarImage'

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-emerald-500/20 font-semibold text-emerald-300', className)}
      {...props}
    />
  )
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
